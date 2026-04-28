import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Product as PrismaProduct, Prisma } from "@prisma/client";
import {
  IProductRepository,
  FindAllProductsFilters,
  ProductStats,
} from "../../../domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { ProductLineageEntity } from "../../../domain/entities/product-lineage.entity";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(
    product: PrismaProduct & { category?: { name: string } },
  ): ProductEntity {
    if (!product.category) {
      throw new Error(`Category not found for product ${product.id}`);
    }
    return new ProductEntity({
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      baseUnit: product.baseUnit,
      basePrice: new Decimal(product.basePrice.toString()),
      length: product.length ? new Decimal(product.length.toString()) : null,
      width: product.width ? new Decimal(product.width.toString()) : null,
      height: product.height ? new Decimal(product.height.toString()) : null,
      description: product.description,
      specText: product.specText,
      costPrice: product.costPrice
        ? new Decimal(product.costPrice.toString())
        : null,
      reorderThreshold: new Decimal(product.reorderThreshold.toString()),
      parentProductId: product.parentProductId ?? undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return null;
    return this.mapToDomain(product);
  }

  async findByIds(ids: number[]): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: { category: true },
    });
    return products.map((p) => this.mapToDomain(p));
  }

  async findByCode(code: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { code },
      include: { category: true },
    });

    if (!product) return null;
    return this.mapToDomain(product);
  }

  async findAll(filters?: FindAllProductsFilters): Promise<ProductEntity[]> {
    let where: Prisma.ProductWhereInput = {};

    if (filters?.lowStock) {
      // Find IDs of products with low stock (quantity <= reorder_threshold OR quantity IS NULL)
      const lowStockProducts = await this.prisma.$queryRaw<{ id: number }[]>`
        SELECT p.id
        FROM products p
        LEFT JOIN inventories i ON p.id = i.product_id
        WHERE i.quantity IS NULL OR i.quantity <= p.reorder_threshold
      `;
      const lowStockProductIds = lowStockProducts.map((p) => p.id);

      // If no products match, return empty array immediately
      if (lowStockProductIds.length === 0) {
        return [];
      }

      where = {
        id: { in: lowStockProductIds },
      };
    }
    if (filters?.keyword) {
      where.OR = [
        { code: { contains: filters.keyword, mode: "insensitive" } },
        { name: { contains: filters.keyword, mode: "insensitive" } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.baseUnit) {
      where.baseUnit = filters.baseUnit;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { category: true },
    });
    return products.map((p) => this.mapToDomain(p));
  }

  async getStats(): Promise<ProductStats> {
    const result = await this.prisma.$queryRaw<
      Array<{
        total: bigint;
        low_stock: bigint;
        receipted_today: bigint;
        issued_today: bigint;
      }>
    >`
      SELECT
        (SELECT COUNT(*) FROM products) AS total,
        (
          SELECT COUNT(*)
          FROM products p
          LEFT JOIN inventories i ON p.id = i.product_id
          WHERE i.quantity IS NULL OR i.quantity <= p.reorder_threshold
        ) AS low_stock,
        (
          SELECT COUNT(DISTINCT rtl.product_id)
          FROM receipt_ticket_lines rtl
          JOIN receipt_tickets rt ON rtl.ticket_id = rt.id
          WHERE DATE_TRUNC('day', rt.created_at) = DATE_TRUNC('day', NOW())
        ) AS receipted_today,
        (
          SELECT COUNT(DISTINCT itl.product_id)
          FROM issue_ticket_lines itl
          JOIN issue_tickets it ON itl.ticket_id = it.id
          WHERE DATE_TRUNC('day', it.created_at) = DATE_TRUNC('day', NOW())
        ) AS issued_today
    `;

    const stats = result[0];

    return {
      total: Number(stats?.total || 0),
      lowStock: Number(stats?.low_stock || 0),
      receiptedToday: Number(stats?.receipted_today || 0),
      issuedToday: Number(stats?.issued_today || 0),
    };
  }

  async create(
    product: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProductEntity> {
    const created = await this.prisma.product.create({
      data: {
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        baseUnit: product.baseUnit,
        basePrice: product.basePrice.toString(),
        costPrice: product.costPrice?.toString(),
        reorderThreshold: product.reorderThreshold.toString(),
        description: product.description,
        specText: product.specText,
        length: product.length ? product.length.toString() : null,
        width: product.width ? product.width.toString() : null,
        height: product.height ? product.height.toString() : null,
        parentProductId: product.parentProductId,
      },
      include: { category: true },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: number,
    product: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        baseUnit: product.baseUnit,
        basePrice: product.basePrice?.toString(),
        costPrice: product.costPrice?.toString(),
        reorderThreshold: product.reorderThreshold?.toString(),
        description: product.description,
        specText: product.specText,
        length: product.length === null ? null : product.length?.toString(),
        width: product.width === null ? null : product.width?.toString(),
        height: product.height === null ? null : product.height?.toString(),
        parentProductId: product.parentProductId,
      },
      include: { category: true },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async hasHistory(id: number): Promise<boolean> {
    const [
      inventory,
      receiptLine,
      issueLine,
      movement,
      splitSource,
      splitTarget,
    ] = await Promise.all([
      this.prisma.inventory.findFirst({ where: { productId: id } }),
      this.prisma.receiptTicketLine.findFirst({ where: { productId: id } }),
      this.prisma.issueTicketLine.findFirst({ where: { productId: id } }),
      this.prisma.stockMovement.findFirst({ where: { productId: id } }),
      this.prisma.splitTicket.findFirst({ where: { sourceProductId: id } }),
      this.prisma.splitTicketLine.findFirst({ where: { targetProductId: id } }),
    ]);

    return !!(
      inventory ||
      receiptLine ||
      issueLine ||
      movement ||
      splitSource ||
      splitTarget
    );
  }

  async findLineage(id: number): Promise<ProductLineageEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        parentProduct: {
          include: { category: true },
        },
        splitTargets: {
          include: { ticket: true },
        },
        childProducts: {
          include: {
            category: true,
            splitTargets: {
              include: { ticket: true },
            },
          },
        },
      },
    });

    if (!product) return null;

    // Find the split ticket line that created the current product
    const creationLine = product.splitTargets.find(
      (line) => line.targetProductId === id,
    );

    const lineage = new ProductLineageEntity({
      currentProduct: this.mapToDomain(product),
      children: product.childProducts.map((child) => {
        const childCreationLine = child.splitTargets.find(
          (line) => line.targetProductId === child.id,
        );

        let splitTicket: SplitTicketEntity | undefined = undefined;
        if (childCreationLine) {
          const ticket = childCreationLine.ticket;
          splitTicket = new SplitTicketEntity({
            id: ticket.id,
            ticketNo: ticket.ticketNo,
            date: ticket.date,
            status: ticket.status as TransactionStatus,
            createdBy: ticket.createdBy,
            sourceProductId: ticket.sourceProductId,
            sourceQty: new Decimal(ticket.sourceQty.toString()),
            sourceUnitCode: ticket.sourceUnitCode,
            note: ticket.note ?? undefined,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
          });
        }

        return {
          product: this.mapToDomain(child),
          splitTicket,
        };
      }),
    });

    if (product.parentProduct && creationLine) {
      const parentTicket = creationLine.ticket;
      lineage.parent = {
        product: this.mapToDomain(product.parentProduct),
        splitTicket: new SplitTicketEntity({
          id: parentTicket.id,
          ticketNo: parentTicket.ticketNo,
          date: parentTicket.date,
          status: parentTicket.status as TransactionStatus,
          createdBy: parentTicket.createdBy,
          sourceProductId: parentTicket.sourceProductId,
          sourceQty: new Decimal(parentTicket.sourceQty.toString()),
          sourceUnitCode: parentTicket.sourceUnitCode,
          note: parentTicket.note ?? undefined,
          createdAt: parentTicket.createdAt,
          updatedAt: parentTicket.updatedAt,
        }),
      };
    }

    return lineage;
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Product as PrismaProduct } from "@prisma/client";
import { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
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
      length: product.length
        ? new Decimal(product.length.toString())
        : undefined,
      width: product.width ? new Decimal(product.width.toString()) : undefined,
      height: product.height
        ? new Decimal(product.height.toString())
        : undefined,
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

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      include: { category: true },
    });
    return products.map((p) => this.mapToDomain(p));
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
        length: product.length?.toString(),
        width: product.width?.toString(),
        height: product.height?.toString(),
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
        length: product.length?.toString(),
        width: product.width?.toString(),
        height: product.height?.toString(),
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
}

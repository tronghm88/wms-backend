import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  IInventoryRepository,
  InventorySnapshotItem,
  InventoryStockReportFilters,
  ProductStockExportItem,
  ProductStockReportItem,
  StockConversionItem,
  StockExportReportFilters,
} from "../../../domain/contracts/inventory.repository.interface";
import { InventoryEntity } from "../../../domain/entities/inventory.entity";
import { Decimal } from "decimal.js";
import {
  Prisma,
  StockMovementType as PrismaStockMovementType,
} from "@prisma/client";
import { StockMovementType } from "../../../domain/enums";
import { TicketTypeFilter } from "../../../domain/contracts/inventory.repository.interface";

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByProductId(productId: number): Promise<InventoryEntity | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });
    if (!inventory) return null;
    return new InventoryEntity({
      ...inventory,
      quantity: new Decimal(inventory.quantity.toString()),
    });
  }

  async findAll(): Promise<InventoryEntity[]> {
    const inventories = await this.prisma.inventory.findMany();
    return inventories.map(
      (inv) =>
        new InventoryEntity({
          ...inv,
          quantity: new Decimal(inv.quantity.toString()),
        }),
    );
  }

  async findAllActiveStock(): Promise<InventorySnapshotItem[]> {
    const stocks = await this.prisma.inventory.findMany({
      where: {
        quantity: {
          gt: 0,
        },
      },
      select: {
        productId: true,
        quantity: true,
        unitCode: true,
        lastUpdated: true,
        product: {
          select: {
            code: true,
            name: true,
            length: true,
            width: true,
            height: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return stocks.map((stock) => ({
      productId: stock.productId,
      productCode: stock.product.code,
      productName: stock.product.name,
      categoryName: stock.product.category.name,
      quantity: new Decimal(stock.quantity.toString()),
      unitCode: stock.unitCode,
      length: stock.product.length
        ? new Decimal(stock.product.length.toString())
        : null,
      width: stock.product.width
        ? new Decimal(stock.product.width.toString())
        : null,
      height: stock.product.height
        ? new Decimal(stock.product.height.toString())
        : null,
      lastUpdated: stock.lastUpdated,
    }));
  }

  async updateQuantity(
    productId: number,
    delta: Decimal,
    unitCode: string,
  ): Promise<InventoryEntity> {
    const inventory = await this.prisma.inventory.upsert({
      where: { productId },
      update: {
        quantity: {
          increment: delta as unknown as Prisma.Decimal,
        },
      },
      create: {
        productId,
        quantity: delta as unknown as Prisma.Decimal,
        unitCode,
      },
    });

    return new InventoryEntity({
      ...inventory,
      quantity: new Decimal(inventory.quantity.toString()),
    });
  }

  // ─── Stock Report ──────────────────────────────────────────────────────────

  async getStockReport(filters: InventoryStockReportFilters): Promise<{
    items: ProductStockReportItem[];
    total: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    // Resolve which txTypes to include in the closing-stock filter
    const closingTxTypes = this.resolveTxTypes(filters.ticketType);

    // ── 1. Fetch products (with category, base unit, and conversions) ────────
    const productWhere: Prisma.ProductWhereInput = {};
    if (filters.categoryId) productWhere.categoryId = filters.categoryId;
    if (filters.keyword) {
      productWhere.OR = [
        { name: { contains: filters.keyword, mode: "insensitive" } },
        { code: { contains: filters.keyword, mode: "insensitive" } },
      ];
    }

    const [totalCount, products] = await Promise.all([
      this.prisma.product.count({ where: productWhere }),
      this.prisma.product.findMany({
        where: productWhere,
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: {
          category: { select: { id: true, name: true } },
          unit: { select: { code: true, label: true } },
          unitConversions: {
            include: { to: { select: { code: true, label: true } } },
          },
        },
      }),
    ]);

    if (products.length === 0) {
      return { items: [], total: totalCount };
    }

    const productIds = products.map((p) => p.id);

    // ── 2. Batch-fetch opening balances (latest qtyAfter before startDate) ───
    // Uses a lateral-style query via ROW_NUMBER to get the last row per product
    const openingRows = await this.prisma.$queryRaw<
      Array<{ product_id: number; qty_after: string }>
    >`
      SELECT DISTINCT ON (product_id) product_id, qty_after::text
      FROM stock_movements
      WHERE product_id = ANY(${productIds}::int[])
        AND created_at < ${filters.startDate}
      ORDER BY product_id, created_at DESC
    `;

    // ── 3. Batch-fetch closing balances (latest qtyAfter up to endDate, optionally filtered by txType) ─
    const closingRows = await this.prisma.$queryRaw<
      Array<{ product_id: number; qty_after: string }>
    >`
      SELECT DISTINCT ON (product_id) product_id, qty_after::text
      FROM stock_movements
      WHERE product_id = ANY(${productIds}::int[])
        AND created_at <= ${filters.endDate}
        ${closingTxTypes ? Prisma.sql`AND tx_type = ANY(${closingTxTypes}::"StockMovementType"[])` : Prisma.empty}
      ORDER BY product_id, created_at DESC
    `;

    const openingMap = new Map<number, Decimal>();
    for (const row of openingRows) {
      openingMap.set(row.product_id, new Decimal(row.qty_after));
    }
    const closingMap = new Map<number, Decimal>();
    for (const row of closingRows) {
      closingMap.set(row.product_id, new Decimal(row.qty_after));
    }

    // ── 4. Assemble result ───────────────────────────────────────────────────
    const items: ProductStockReportItem[] = products.map((product) => {
      const openingBase = openingMap.get(product.id) ?? new Decimal(0);
      const closingBase = closingMap.get(product.id) ?? openingBase;

      const conversions: StockConversionItem[] = product.unitConversions.map(
        (uc) => {
          const factor = new Decimal(uc.factor.toString());
          return {
            toUnit: uc.toUnit,
            toUnitLabel: uc.to.label,
            factor,
            openingStock: openingBase.mul(factor),
            closingStock: closingBase.mul(factor),
          };
        },
      );

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        categoryId: product.category.id,
        categoryName: product.category.name,
        baseUnit: product.unit.code,
        baseUnitLabel: product.unit.label,
        openingStockBase: openingBase,
        closingStockBase: closingBase,
        conversions,
      };
    });

    return { items, total: totalCount };
  }

  // ─── Stock Export Report (Excel) ───────────────────────────────────────────

  async getStockExportReport(
    filters: StockExportReportFilters,
  ): Promise<ProductStockExportItem[]> {
    // ── 1. Fetch ALL products in the category (no pagination) ───────────────
    const products = await this.prisma.product.findMany({
      where: { categoryId: filters.categoryId },
      orderBy: { id: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { code: true, label: true } },
        unitConversions: {
          include: { to: { select: { code: true, label: true } } },
        },
      },
    });

    if (products.length === 0) return [];

    const productIds = products.map((p) => p.id);

    // ── 2. Opening balances (last qty_after strictly before startDate) ───────
    const openingRows = await this.prisma.$queryRaw<
      Array<{ product_id: number; qty_after: string }>
    >`
      SELECT DISTINCT ON (product_id) product_id, qty_after::text
      FROM stock_movements
      WHERE product_id = ANY(${productIds}::int[])
        AND created_at < ${filters.startDate}
      ORDER BY product_id, created_at DESC
    `;

    // ── 3. Closing balances (last qty_after up to endDate) ───────────────────
    const closingRows = await this.prisma.$queryRaw<
      Array<{ product_id: number; qty_after: string }>
    >`
      SELECT DISTINCT ON (product_id) product_id, qty_after::text
      FROM stock_movements
      WHERE product_id = ANY(${productIds}::int[])
        AND created_at <= ${filters.endDate}
      ORDER BY product_id, created_at DESC
    `;

    // ── 4. Period IN / OUT sums (IN + SPLIT_IN → input; OUT + SPLIT_OUT → output) ─
    const flowRows = await this.prisma.$queryRaw<
      Array<{
        product_id: number;
        input_qty: string;
        output_qty: string;
      }>
    >`
      SELECT
        product_id,
        COALESCE(SUM(CASE WHEN tx_type IN ('IN', 'SPLIT_IN')  AND delta_qty > 0 THEN delta_qty ELSE 0 END), 0)::text AS input_qty,
        COALESCE(SUM(CASE WHEN tx_type IN ('OUT', 'SPLIT_OUT') AND delta_qty < 0 THEN ABS(delta_qty) ELSE 0 END), 0)::text AS output_qty
      FROM stock_movements
      WHERE product_id = ANY(${productIds}::int[])
        AND created_at >= ${filters.startDate}
        AND created_at <= ${filters.endDate}
      GROUP BY product_id
    `;

    // ── 5. Build lookup maps ─────────────────────────────────────────────────
    const openingMap = new Map<number, Decimal>();
    for (const row of openingRows)
      openingMap.set(row.product_id, new Decimal(row.qty_after));

    const closingMap = new Map<number, Decimal>();
    for (const row of closingRows)
      closingMap.set(row.product_id, new Decimal(row.qty_after));

    const flowMap = new Map<
      number,
      { inputQtyBase: Decimal; outputQtyBase: Decimal }
    >();
    for (const row of flowRows)
      flowMap.set(row.product_id, {
        inputQtyBase: new Decimal(row.input_qty),
        outputQtyBase: new Decimal(row.output_qty),
      });

    // ── 6. Assemble result ───────────────────────────────────────────────────
    return products.map((product) => {
      const openingBase = openingMap.get(product.id) ?? new Decimal(0);
      const closingBase = closingMap.get(product.id) ?? openingBase;
      const flow = flowMap.get(product.id) ?? {
        inputQtyBase: new Decimal(0),
        outputQtyBase: new Decimal(0),
      };

      const conversions: StockConversionItem[] = product.unitConversions.map(
        (uc) => {
          const factor = new Decimal(uc.factor.toString());
          return {
            toUnit: uc.toUnit,
            toUnitLabel: uc.to.label,
            factor,
            openingStock: openingBase.mul(factor),
            closingStock: closingBase.mul(factor),
          };
        },
      );

      return {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        categoryId: product.category.id,
        categoryName: product.category.name,
        baseUnit: product.unit.code,
        baseUnitLabel: product.unit.label,
        openingStockBase: openingBase,
        closingStockBase: closingBase,
        conversions,
        specText: product.specText ?? null,
        width: product.width ? new Decimal(product.width.toString()) : null,
        height: product.height ? new Decimal(product.height.toString()) : null,
        length: product.length ? new Decimal(product.length.toString()) : null,
        inputQtyBase: flow.inputQtyBase,
        outputQtyBase: flow.outputQtyBase,
      };
    });
  }

  /** Maps the user-facing ticket type filter to DB enum values. */
  private resolveTxTypes(
    ticketType?: TicketTypeFilter,
  ): PrismaStockMovementType[] | null {
    if (!ticketType) return null;
    const map: Record<TicketTypeFilter, StockMovementType[]> = {
      receipt: [StockMovementType.IN],
      issue: [StockMovementType.OUT],
      split: [StockMovementType.SPLIT_IN, StockMovementType.SPLIT_OUT],
    };
    return map[ticketType] as unknown as PrismaStockMovementType[];
  }
}

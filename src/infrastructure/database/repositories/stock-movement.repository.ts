import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  AuditLogItem,
  IStockMovementRepository,
  MovementHistoryFilters,
  RegisterMovementData,
  StockMovementSearchFilters,
} from "../../../domain/contracts/stock-movement.repository.interface";
import { StockMovementEntity } from "../../../domain/entities/stock-movement.entity";
import { Decimal } from "decimal.js";
import { StockMovementType } from "../../../domain/enums";
import {
  Prisma,
  StockMovement as PrismaStockMovement,
  StockMovementType as PrismaStockMovementType,
} from "@prisma/client";

@Injectable()
export class StockMovementRepository implements IStockMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<StockMovementEntity | null> {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
    });
    if (!movement) return null;
    return this.mapToEntity(movement);
  }

  async findByProductId(productId: number): Promise<StockMovementEntity[]> {
    const movements = await this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return movements.map((m) => this.mapToEntity(m));
  }

  async findByReference(
    referenceId: number,
    referenceType: string,
  ): Promise<StockMovementEntity[]> {
    const movements = await this.prisma.stockMovement.findMany({
      where: { referenceId, referenceType },
      orderBy: { createdAt: "desc" },
    });
    return movements.map((m) => this.mapToEntity(m));
  }

  async create(
    movement: Omit<StockMovementEntity, "id" | "createdAt">,
  ): Promise<StockMovementEntity> {
    const newMovement = await this.prisma.stockMovement.create({
      data: {
        productId: movement.productId,
        txType: movement.txType as unknown as PrismaStockMovementType,
        referenceId: movement.referenceId,
        referenceType: movement.referenceType,
        deltaQty: movement.deltaQty as unknown as Prisma.Decimal,
        qtyAfter: movement.qtyAfter as unknown as Prisma.Decimal,
        performedBy: movement.performedBy,
        unitCost: movement.unitCost as unknown as Prisma.Decimal,
        note: movement.note,
      },
    });

    return this.mapToEntity(newMovement);
  }

  async search(filters: StockMovementSearchFilters): Promise<AuditLogItem[]> {
    const where: Prisma.StockMovementWhereInput = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters.productId) where.productId = filters.productId;
    if (filters.txType)
      where.txType = filters.txType as unknown as PrismaStockMovementType;
    if (filters.performedBy) where.performedBy = filters.performedBy;

    if (filters.categoryId) {
      where.product = { categoryId: filters.categoryId };
    }

    if (filters.ticketNo) {
      const [rt, it, st] = await Promise.all([
        this.prisma.receiptTicket.findFirst({
          where: { ticketNo: filters.ticketNo },
          select: { id: true },
        }),
        this.prisma.issueTicket.findFirst({
          where: { ticketNo: filters.ticketNo },
          select: { id: true },
        }),
        this.prisma.splitTicket.findFirst({
          where: { ticketNo: filters.ticketNo },
          select: { id: true },
        }),
      ]);

      const or: Prisma.StockMovementWhereInput[] = [];
      if (rt) or.push({ referenceId: rt.id, referenceType: "RECEIPT_TICKET" });
      if (it) or.push({ referenceId: it.id, referenceType: "ISSUE_TICKET" });
      if (st) or.push({ referenceId: st.id, referenceType: "SplitTicket" });

      if (or.length > 0) {
        where.OR = or;
      } else {
        // No ticket matches, return empty results
        return [];
      }
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        performer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const results: AuditLogItem[] = [];

    // Collect reference IDs to fetch ticket numbers in batch
    const receiptIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "RECEIPT_TICKET")
          .map((m) => m.referenceId),
      ),
    ];
    const issueIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "ISSUE_TICKET")
          .map((m) => m.referenceId),
      ),
    ];
    const splitIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "SplitTicket")
          .map((m) => m.referenceId),
      ),
    ];

    const [receipts, issues, splits] = await Promise.all([
      receiptIds.length > 0
        ? this.prisma.receiptTicket.findMany({
            where: { id: { in: receiptIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
      issueIds.length > 0
        ? this.prisma.issueTicket.findMany({
            where: { id: { in: issueIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
      splitIds.length > 0
        ? this.prisma.splitTicket.findMany({
            where: { id: { in: splitIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
    ]);

    const ticketNoMap = new Map<string, string>();
    receipts.forEach((r) =>
      ticketNoMap.set(`RECEIPT_TICKET:${r.id}`, r.ticketNo),
    );
    issues.forEach((i) => ticketNoMap.set(`ISSUE_TICKET:${i.id}`, i.ticketNo));
    splits.forEach((s) => ticketNoMap.set(`SplitTicket:${s.id}`, s.ticketNo));

    for (const m of movements) {
      const ticketNo =
        ticketNoMap.get(`${m.referenceType}:${m.referenceId}`) || null;

      results.push({
        id: m.id,
        productId: m.productId,
        productCode: m.product.code,
        productName: m.product.name,
        categoryId: m.product.category.id,
        categoryName: m.product.category.name,
        txType: m.txType as unknown as StockMovementType,
        referenceId: m.referenceId,
        referenceType: m.referenceType,
        ticketNo,
        deltaQty: new Decimal(m.deltaQty.toString()),
        qtyAfter: new Decimal(m.qtyAfter.toString()),
        performedBy: m.performedBy,
        performerName: m.performer.fullName,
        unitCost: m.unitCost ? new Decimal(m.unitCost.toString()) : null,
        note: m.note,
        createdAt: m.createdAt,
      });
    }

    return results;
  }

  async registerMovement(
    data: RegisterMovementData,
    tx?: Prisma.TransactionClient,
  ): Promise<StockMovementEntity> {
    const client = tx || this.prisma;

    // 1. Update Inventory and get new quantity (Running Balance)
    const inv = await client.inventory.upsert({
      where: { productId: data.productId },
      update: {
        quantity: {
          increment: data.deltaQty as unknown as Prisma.Decimal,
        },
      },
      create: {
        productId: data.productId,
        quantity: data.deltaQty as unknown as Prisma.Decimal,
        unitCode: data.unitCode,
      },
    });

    // 2. Create StockMovement with the calculated running balance (qtyAfter)
    const sm = await client.stockMovement.create({
      data: {
        productId: data.productId,
        txType: data.txType as unknown as PrismaStockMovementType,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        deltaQty: data.deltaQty as unknown as Prisma.Decimal,
        qtyAfter: inv.quantity,
        performedBy: data.performedBy,
        unitCost: data.unitCost as unknown as Prisma.Decimal,
        note: data.note,
      },
    });

    return this.mapToEntity(sm);
  }

  private mapToEntity(m: PrismaStockMovement): StockMovementEntity {
    return new StockMovementEntity(
      m.id,
      m.productId,
      m.txType as unknown as StockMovementType,
      m.referenceId,
      m.referenceType,
      new Decimal(m.deltaQty.toString()),
      new Decimal(m.qtyAfter.toString()),
      m.performedBy,
      m.unitCost ? new Decimal(m.unitCost.toString()) : null,
      m.note,
      m.createdAt,
    );
  }

  // ─── New methods for the inventory stock report ──────────────────────────────────

  async getQtyBeforeDate(
    productId: number,
    beforeDate: Date,
  ): Promise<Decimal> {
    const row = await this.prisma.stockMovement.findFirst({
      where: { productId, createdAt: { lt: beforeDate } },
      orderBy: { createdAt: "desc" },
      select: { qtyAfter: true },
    });
    return row ? new Decimal(row.qtyAfter.toString()) : new Decimal(0);
  }

  async getMovementHistory(filters: MovementHistoryFilters): Promise<{
    items: AuditLogItem[];
    total: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {
      productId: filters.productId,
      createdAt: { gte: filters.startDate, lte: filters.endDate },
    };

    if (filters.txTypes && filters.txTypes.length > 0) {
      where.txType = {
        in: filters.txTypes as unknown as PrismaStockMovementType[],
      };
    }

    const [total, movements] = await Promise.all([
      this.prisma.stockMovement.count({ where }),
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: { include: { category: true } },
          performer: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Collect reference IDs to fetch ticket numbers in batch
    const receiptIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "RECEIPT_TICKET")
          .map((m) => m.referenceId),
      ),
    ];
    const issueIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "ISSUE_TICKET")
          .map((m) => m.referenceId),
      ),
    ];
    const splitIds = [
      ...new Set(
        movements
          .filter((m) => m.referenceType === "SplitTicket")
          .map((m) => m.referenceId),
      ),
    ];

    const [receipts, issues, splits] = await Promise.all([
      receiptIds.length > 0
        ? this.prisma.receiptTicket.findMany({
            where: { id: { in: receiptIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
      issueIds.length > 0
        ? this.prisma.issueTicket.findMany({
            where: { id: { in: issueIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
      splitIds.length > 0
        ? this.prisma.splitTicket.findMany({
            where: { id: { in: splitIds } },
            select: { id: true, ticketNo: true },
          })
        : Promise.resolve([] as Array<{ id: number; ticketNo: string }>),
    ]);

    const ticketNoMap = new Map<string, string>();
    receipts.forEach((r) =>
      ticketNoMap.set(`RECEIPT_TICKET:${r.id}`, r.ticketNo),
    );
    issues.forEach((i) => ticketNoMap.set(`ISSUE_TICKET:${i.id}`, i.ticketNo));
    splits.forEach((s) => ticketNoMap.set(`SplitTicket:${s.id}`, s.ticketNo));

    const items: AuditLogItem[] = movements.map((m) => {
      const ticketNo =
        ticketNoMap.get(`${m.referenceType}:${m.referenceId}`) ?? null;
      return {
        id: m.id,
        productId: m.productId,
        productCode: m.product.code,
        productName: m.product.name,
        categoryId: m.product.category.id,
        categoryName: m.product.category.name,
        txType: m.txType as unknown as StockMovementType,
        referenceId: m.referenceId,
        referenceType: m.referenceType,
        ticketNo,
        deltaQty: new Decimal(m.deltaQty.toString()),
        qtyAfter: new Decimal(m.qtyAfter.toString()),
        performedBy: m.performedBy,
        performerName: m.performer.fullName,
        unitCost: m.unitCost ? new Decimal(m.unitCost.toString()) : null,
        note: m.note,
        createdAt: m.createdAt,
      };
    });

    return { items, total };
  }
}

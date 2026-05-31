import { Injectable } from "@nestjs/common";
import {
  Prisma,
  SplitTicket as PrismaSplitTicket,
  SplitTicketLine as PrismaSplitTicketLine,
  TransactionStatus as PrismaTransactionStatus,
  User as PrismaUser,
  Product as PrismaProduct,
  Unit as PrismaUnit,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { ISplitTicketRepository } from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { SplitTicketLineEntity } from "../../../domain/entities/split-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import { SplitStatsDto } from "../../../application/dtos/split-stats.dto";

@Injectable()
export class SplitTicketRepository implements ISplitTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<SplitTicketEntity | null> {
    const ticket = await this.prisma.splitTicket.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });
    if (!ticket) return null;
    return this.mapToEntity(ticket);
  }

  async findByIdForExport(id: number): Promise<SplitTicketEntity | null> {
    const ticket = await this.prisma.splitTicket.findUnique({
      where: { id },
      include: {
        sourceProduct: true,
        unit: true,
        lines: {
          include: {
            targetProduct: {
              include: { unit: true },
            },
          },
        },
      },
    });
    if (!ticket) return null;

    const entity = new SplitTicketEntity({
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      date: ticket.date,
      status: ticket.status as unknown as TransactionStatus,
      createdBy: ticket.createdBy,
      sourceProductId: ticket.sourceProductId,
      sourceQty: new Decimal(ticket.sourceQty.toString()),
      sourceUnitCode: ticket.sourceUnitCode,
      note: ticket.note ?? undefined,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      sourceProductName: ticket.sourceProduct?.name,
      sourceUnitLabel: ticket.unit?.label,
    });

    entity.lines = ticket.lines.map((l) =>
      this.mapLineToEntityWithProduct(
        l as PrismaSplitTicketLine & {
          targetProduct: (PrismaProduct & { unit: PrismaUnit }) | null;
        },
      ),
    );
    entity.linesCount = entity.lines.length;
    entity.totalSplitQty = entity.lines.reduce(
      (sum, line) => sum.plus(line.quantity),
      new Decimal(0),
    );

    return entity;
  }

  async findByTicketNo(ticketNo: string): Promise<SplitTicketEntity | null> {
    const ticket = await this.prisma.splitTicket.findUnique({
      where: { ticketNo },
      include: {
        lines: true,
      },
    });
    if (!ticket) return null;
    return this.mapToEntity(ticket);
  }

  async findAll(): Promise<SplitTicketEntity[]> {
    const tickets = await this.prisma.splitTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lines: true,
        creator: true,
        sourceProduct: true,
        unit: true,
      },
    });
    return tickets.map((t) => this.mapToEntity(t));
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    status?: TransactionStatus;
    creatorId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }): Promise<{ items: SplitTicketEntity[]; total: number }> {
    const where: Prisma.SplitTicketWhereInput = {};

    if (params.status) {
      where.status = params.status as unknown as PrismaTransactionStatus;
    }

    if (params.creatorId) {
      where.createdBy = params.creatorId;
    }

    if (params.fromDate || params.toDate) {
      where.date = {};
      if (params.fromDate) {
        where.date.gte = params.fromDate;
      }
      if (params.toDate) {
        where.date.lte = params.toDate;
      }
    }

    if (params.search) {
      where.OR = [
        { ticketNo: { contains: params.search, mode: "insensitive" } },
        {
          sourceProduct: {
            name: { contains: params.search, mode: "insensitive" },
          },
        },
      ];
    }

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.splitTicket.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          lines: true,
          creator: true,
          sourceProduct: true,
          unit: true,
        },
      }),
      this.prisma.splitTicket.count({ where }),
    ]);

    return {
      items: tickets.map((t) => this.mapToEntity(t)),
      total,
    };
  }

  async getLastTicketNo(yearMonth: string): Promise<string | null> {
    const ticket = await this.prisma.splitTicket.findFirst({
      where: {
        ticketNo: {
          startsWith: `ST-${yearMonth}-`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return ticket ? ticket.ticketNo : null;
  }

  async create(
    ticket: Omit<SplitTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<SplitTicketEntity> {
    const newTicket = await this.prisma.splitTicket.create({
      data: {
        ticketNo: ticket.ticketNo,
        date: ticket.date,
        status: ticket.status as unknown as PrismaTransactionStatus,
        createdBy: ticket.createdBy,
        sourceProductId: ticket.sourceProductId,
        sourceQty: ticket.sourceQty as unknown as Prisma.Decimal,
        sourceUnitCode: ticket.sourceUnitCode,
        note: ticket.note,
      },
    });

    return this.mapToEntity(newTicket);
  }

  async update(
    id: number,
    ticket: Partial<SplitTicketEntity>,
  ): Promise<SplitTicketEntity> {
    const data: Prisma.SplitTicketUncheckedUpdateInput = {};
    if (ticket.ticketNo) data.ticketNo = ticket.ticketNo;
    if (ticket.date) data.date = ticket.date;
    if (ticket.status)
      data.status = ticket.status as unknown as PrismaTransactionStatus;
    if (ticket.createdBy) data.createdBy = ticket.createdBy;
    if (ticket.sourceProductId) data.sourceProductId = ticket.sourceProductId;
    if (ticket.sourceQty)
      data.sourceQty = ticket.sourceQty as unknown as Prisma.Decimal;
    if (ticket.sourceUnitCode) data.sourceUnitCode = ticket.sourceUnitCode;
    if (ticket.note !== undefined) data.note = ticket.note;

    const updatedTicket = await this.prisma.splitTicket.update({
      where: { id },
      data,
      include: {
        lines: true,
      },
    });

    return this.mapToEntity(updatedTicket);
  }

  async addLines(
    ticketId: number,
    lines: Omit<
      SplitTicketLineEntity,
      "id" | "ticketId" | "createdAt" | "updatedAt"
    >[],
  ): Promise<SplitTicketLineEntity[]> {
    const createdLines = await this.prisma.$transaction(
      lines.map((line) =>
        this.prisma.splitTicketLine.create({
          data: {
            ticketId,
            targetProductId: line.targetProductId,
            quantity: line.quantity as unknown as Prisma.Decimal,
            unitCode: line.unitCode,
            isNewProduct: line.isNewProduct,
            note: line.note,
          },
        }),
      ),
    );

    return createdLines.map((l) => this.mapLineToEntity(l));
  }

  async deleteLines(ticketId: number): Promise<void> {
    await this.prisma.splitTicketLine.deleteMany({
      where: { ticketId },
    });
  }

  async findLineById(lineId: number): Promise<SplitTicketLineEntity | null> {
    const line = await this.prisma.splitTicketLine.findUnique({
      where: { id: lineId },
    });
    if (!line) return null;
    return this.mapLineToEntity(line);
  }

  async updateLine(
    lineId: number,
    line: Partial<SplitTicketLineEntity>,
  ): Promise<SplitTicketLineEntity> {
    const data: Prisma.SplitTicketLineUncheckedUpdateInput = {};
    if (line.targetProductId) data.targetProductId = line.targetProductId;
    if (line.quantity)
      data.quantity = line.quantity as unknown as Prisma.Decimal;
    if (line.unitCode) data.unitCode = line.unitCode;
    if (line.isNewProduct !== undefined) data.isNewProduct = line.isNewProduct;
    if (line.note !== undefined) data.note = line.note;

    const updatedLine = await this.prisma.splitTicketLine.update({
      where: { id: lineId },
      data,
    });
    return this.mapLineToEntity(updatedLine);
  }

  async deleteLine(lineId: number): Promise<void> {
    await this.prisma.splitTicketLine.delete({
      where: { id: lineId },
    });
  }

  async getStats(from: Date, to: Date): Promise<SplitStatsDto> {
    const where: Prisma.SplitTicketWhereInput = {
      date: {
        gte: from,
        lte: to,
      },
    };

    const [totalCount, pendingCount, lineCount, splitedProductCountResult] =
      await Promise.all([
        this.prisma.splitTicket.count({ where }),
        this.prisma.splitTicket.count({
          where: {
            ...where,
            status: PrismaTransactionStatus.DRAFT,
          },
        }),
        this.prisma.splitTicketLine.count({
          where: {
            ticket: where,
          },
        }),
        this.prisma.splitTicket.aggregate({
          where: {
            ...where,
            status: PrismaTransactionStatus.CONFIRMED,
          },
          _sum: {
            sourceQty: true,
          },
        }),
      ]);

    return {
      totalCount,
      totalLines: lineCount,
      pendingCount,
      splitedProductCount:
        splitedProductCountResult._sum.sourceQty?.toString() || "0",
    };
  }

  private mapToEntity(
    ticket: PrismaSplitTicket & {
      lines?: PrismaSplitTicketLine[];
      creator?: PrismaUser;
      sourceProduct?: PrismaProduct;
      unit?: PrismaUnit;
    },
  ): SplitTicketEntity {
    return new SplitTicketEntity({
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      date: ticket.date,
      status: ticket.status as unknown as TransactionStatus,
      createdBy: ticket.createdBy,
      sourceProductId: ticket.sourceProductId,
      sourceQty: new Decimal(ticket.sourceQty.toString()),
      sourceUnitCode: ticket.sourceUnitCode,
      note: ticket.note ?? undefined,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lines: ticket.lines?.map((l) => this.mapLineToEntity(l)),
      createdByName: ticket.creator ? ticket.creator.fullName : undefined,
      sourceProductCode: ticket.sourceProduct
        ? ticket.sourceProduct.code
        : undefined,
      sourceProductName: ticket.sourceProduct
        ? ticket.sourceProduct.name
        : undefined,
      sourceUnitLabel: ticket.unit ? ticket.unit.label : undefined,
    });
  }

  private mapLineToEntity(line: PrismaSplitTicketLine): SplitTicketLineEntity {
    return new SplitTicketLineEntity({
      id: line.id,
      ticketId: line.ticketId,
      targetProductId: line.targetProductId,
      quantity: new Decimal(line.quantity.toString()),
      unitCode: line.unitCode,
      isNewProduct: line.isNewProduct,
      note: line.note ?? undefined,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
    });
  }

  private mapLineToEntityWithProduct(
    line: PrismaSplitTicketLine & {
      targetProduct: (PrismaProduct & { unit: PrismaUnit }) | null;
    },
  ): SplitTicketLineEntity {
    return new SplitTicketLineEntity({
      id: line.id,
      ticketId: line.ticketId,
      targetProductId: line.targetProductId,
      quantity: new Decimal(line.quantity.toString()),
      unitCode: line.unitCode,
      isNewProduct: line.isNewProduct,
      note: line.note ?? undefined,
      createdAt: line.createdAt,
      updatedAt: line.updatedAt,
      targetProductName: line.targetProduct?.name,
      productWidth: line.targetProduct?.width
        ? new Decimal(line.targetProduct.width.toString())
        : undefined,
      productLength: line.targetProduct?.length
        ? new Decimal(line.targetProduct.length.toString())
        : undefined,
      productHeight: line.targetProduct?.height
        ? new Decimal(line.targetProduct.height.toString())
        : undefined,
      unitLabel: line.targetProduct?.unit?.label ?? line.unitCode,
    });
  }
}

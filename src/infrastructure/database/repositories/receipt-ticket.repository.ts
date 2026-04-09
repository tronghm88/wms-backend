import { Injectable } from "@nestjs/common";
import {
  Prisma,
  TransactionStatus as PrismaTransactionStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";

@Injectable()
export class ReceiptTicketRepository implements IReceiptTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<ReceiptTicketEntity | null> {
    const ticket = await this.prisma.receiptTicket.findUnique({
      where: { id },
    });
    if (!ticket) return null;
    return new ReceiptTicketEntity({
      ...ticket,
      status: ticket.status as unknown as TransactionStatus,
      note: ticket.note ?? undefined,
    });
  }

  async findByTicketNo(ticketNo: string): Promise<ReceiptTicketEntity | null> {
    const ticket = await this.prisma.receiptTicket.findUnique({
      where: { ticketNo },
    });
    if (!ticket) return null;
    return new ReceiptTicketEntity({
      ...ticket,
      status: ticket.status as unknown as TransactionStatus,
      note: ticket.note ?? undefined,
    });
  }

  async findAll(): Promise<ReceiptTicketEntity[]> {
    const tickets = await this.prisma.receiptTicket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tickets.map(
      (t) =>
        new ReceiptTicketEntity({
          ...t,
          status: t.status as unknown as TransactionStatus,
          note: t.note ?? undefined,
        }),
    );
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    status?: TransactionStatus;
    creatorId?: number;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }): Promise<{ items: ReceiptTicketEntity[]; total: number }> {
    const { skip, take, status, creatorId, fromDate, toDate, search } = params;
    const where: Prisma.ReceiptTicketWhereInput = {};

    if (status) {
      where.status = status as unknown as PrismaTransactionStatus;
    }

    if (creatorId) {
      where.createdBy = creatorId;
    }

    if (fromDate || toDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (fromDate) {
        dateFilter.gte = fromDate;
      }
      if (toDate) {
        dateFilter.lte = toDate;
      }
      where.date = dateFilter;
    }

    if (search) {
      where.ticketNo = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.receiptTicket.findMany({
        where,
        skip,
        take,
        orderBy: { date: "desc" },
      }),
      this.prisma.receiptTicket.count({ where }),
    ]);

    return {
      items: items.map(
        (t) =>
          new ReceiptTicketEntity({
            ...t,
            status: t.status as unknown as TransactionStatus,
            note: t.note ?? undefined,
          }),
      ),
      total,
    };
  }

  async getLastTicketNo(yearMonth: string): Promise<string | null> {
    const ticket = await this.prisma.receiptTicket.findFirst({
      where: {
        ticketNo: {
          startsWith: `PN-${yearMonth}-`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return ticket ? ticket.ticketNo : null;
  }

  async create(
    ticket: Omit<ReceiptTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReceiptTicketEntity> {
    const newTicket = await this.prisma.receiptTicket.create({
      data: {
        ticketNo: ticket.ticketNo,
        date: ticket.date,
        status: ticket.status as unknown as PrismaTransactionStatus,
        createdBy: ticket.createdBy,
        note: ticket.note,
      },
    });

    return new ReceiptTicketEntity({
      ...newTicket,
      status: newTicket.status as unknown as TransactionStatus,
      note: newTicket.note ?? undefined,
    });
  }

  async update(
    id: number,
    ticket: Partial<ReceiptTicketEntity>,
  ): Promise<ReceiptTicketEntity> {
    const updatedTicket = await this.prisma.receiptTicket.update({
      where: { id },
      data: {
        ticketNo: ticket.ticketNo,
        date: ticket.date,
        status: ticket.status as unknown as PrismaTransactionStatus,
        createdBy: ticket.createdBy,
        note: ticket.note,
      },
    });

    return new ReceiptTicketEntity({
      ...updatedTicket,
      status: updatedTicket.status as unknown as TransactionStatus,
      note: updatedTicket.note ?? undefined,
    });
  }

  async addLine(
    line: Omit<ReceiptTicketLineEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReceiptTicketLineEntity> {
    const newLine = await this.prisma.receiptTicketLine.create({
      data: {
        ticketId: line.ticketId,
        productId: line.productId,
        quantity: line.quantity,
        unitCode: line.unitCode,
        lengthM: line.lengthM,
        areaM2: line.areaM2,
        weightKg: line.weightKg,
      },
    });

    return new ReceiptTicketLineEntity({
      ...newLine,
      quantity: newLine.quantity,
      lengthM: newLine.lengthM ?? undefined,
      areaM2: newLine.areaM2 ?? undefined,
      weightKg: newLine.weightKg ?? undefined,
    });
  }

  async findLineById(lineId: number): Promise<ReceiptTicketLineEntity | null> {
    const line = await this.prisma.receiptTicketLine.findUnique({
      where: { id: lineId },
    });
    if (!line) return null;
    return new ReceiptTicketLineEntity({
      ...line,
      quantity: line.quantity,
      lengthM: line.lengthM ?? undefined,
      areaM2: line.areaM2 ?? undefined,
      weightKg: line.weightKg ?? undefined,
    });
  }

  async updateLine(
    lineId: number,
    line: Partial<ReceiptTicketLineEntity>,
  ): Promise<ReceiptTicketLineEntity> {
    const updatedLine = await this.prisma.receiptTicketLine.update({
      where: { id: lineId },
      data: {
        productId: line.productId,
        quantity: line.quantity,
        unitCode: line.unitCode,
        lengthM: line.lengthM,
        areaM2: line.areaM2,
        weightKg: line.weightKg,
      },
    });

    return new ReceiptTicketLineEntity({
      ...updatedLine,
      quantity: updatedLine.quantity,
      lengthM: updatedLine.lengthM ?? undefined,
      areaM2: updatedLine.areaM2 ?? undefined,
      weightKg: updatedLine.weightKg ?? undefined,
    });
  }
}

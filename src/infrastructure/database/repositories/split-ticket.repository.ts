import { Injectable } from "@nestjs/common";
import {
  Prisma,
  SplitTicket as PrismaSplitTicket,
  TransactionStatus as PrismaTransactionStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { ISplitTicketRepository } from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";

@Injectable()
export class SplitTicketRepository implements ISplitTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<SplitTicketEntity | null> {
    const ticket = await this.prisma.splitTicket.findUnique({
      where: { id },
    });
    if (!ticket) return null;
    return this.mapToEntity(ticket);
  }

  async findByTicketNo(ticketNo: string): Promise<SplitTicketEntity | null> {
    const ticket = await this.prisma.splitTicket.findUnique({
      where: { ticketNo },
    });
    if (!ticket) return null;
    return this.mapToEntity(ticket);
  }

  async findAll(): Promise<SplitTicketEntity[]> {
    const tickets = await this.prisma.splitTicket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tickets.map((t) => this.mapToEntity(t));
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
    });

    return this.mapToEntity(updatedTicket);
  }

  private mapToEntity(ticket: PrismaSplitTicket): SplitTicketEntity {
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
    });
  }
}

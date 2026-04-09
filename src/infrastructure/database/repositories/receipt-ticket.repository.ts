import { Injectable } from "@nestjs/common";
import { TransactionStatus as PrismaTransactionStatus } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
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
}

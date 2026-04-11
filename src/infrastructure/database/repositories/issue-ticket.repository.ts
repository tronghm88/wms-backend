import { Injectable } from "@nestjs/common";
import {
  Prisma,
  TransactionStatus as PrismaTransactionStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { IIssueTicketRepository } from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";

@Injectable()
export class IssueTicketRepository implements IIssueTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<IssueTicketEntity | null> {
    const ticket = await this.prisma.issueTicket.findUnique({
      where: { id },
    });
    if (!ticket) return null;
    return this.toEntity(ticket);
  }

  async findByCode(code: string): Promise<IssueTicketEntity | null> {
    const ticket = await this.prisma.issueTicket.findUnique({
      where: { ticketNo: code },
    });
    if (!ticket) return null;
    return this.toEntity(ticket);
  }

  async findAll(): Promise<IssueTicketEntity[]> {
    const tickets = await this.prisma.issueTicket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return tickets.map((t) => this.toEntity(t));
  }

  async getLastCode(yearMonth: string): Promise<string | null> {
    const ticket = await this.prisma.issueTicket.findFirst({
      where: {
        ticketNo: {
          startsWith: `PX-${yearMonth}-`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return ticket ? ticket.ticketNo : null;
  }

  async create(
    ticket: Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt" | "lines">,
  ): Promise<IssueTicketEntity> {
    const newTicket = await this.prisma.issueTicket.create({
      data: {
        ticketNo: ticket.code,
        date: ticket.date,
        customerId: ticket.customerId,
        status: ticket.status as unknown as PrismaTransactionStatus,
        createdBy: ticket.createdBy,
        totalAmount: ticket.totalAmount as unknown as Prisma.Decimal,
        note: ticket.note,
      },
    });

    return this.toEntity(newTicket);
  }

  async update(
    id: number,
    ticket: Partial<IssueTicketEntity>,
  ): Promise<IssueTicketEntity> {
    const updatedTicket = await this.prisma.issueTicket.update({
      where: { id },
      data: {
        ticketNo: ticket.code,
        date: ticket.date,
        customerId: ticket.customerId,
        status: ticket.status as unknown as PrismaTransactionStatus,
        createdBy: ticket.createdBy,
        totalAmount: ticket.totalAmount as unknown as Prisma.Decimal,
        note: ticket.note,
      },
    });

    return this.toEntity(updatedTicket);
  }

  private toEntity(prismaTicket: any): IssueTicketEntity {
    return new IssueTicketEntity({
      id: prismaTicket.id,
      code: prismaTicket.ticketNo,
      date: prismaTicket.date,
      customerId: prismaTicket.customerId,
      status: prismaTicket.status as unknown as IssueTicketStatus,
      createdBy: prismaTicket.createdBy,
      totalAmount: new Decimal(prismaTicket.totalAmount.toString()),
      note: prismaTicket.note ?? undefined,
      createdAt: prismaTicket.createdAt,
      updatedAt: prismaTicket.updatedAt,
    });
  }
}

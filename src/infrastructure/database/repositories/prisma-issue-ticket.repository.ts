import { Injectable } from "@nestjs/common";
import {
  Prisma,
  TransactionStatus as PrismaTransactionStatus,
  DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { IIssueTicketRepository } from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketLineEntity } from "../../../domain/entities/issue-ticket-line.entity";
import { IssueTicketStatus, DiscountType } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import {
  IssueTicketNotFoundException,
  InvalidIssueTicketStatusException,
} from "../../../domain/exceptions/issue-ticket.exceptions";

@Injectable()
export class PrismaIssueTicketRepository implements IIssueTicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapStatusToPrisma(
    status: IssueTicketStatus,
  ): PrismaTransactionStatus {
    switch (status) {
      case IssueTicketStatus.DRAFT:
        return PrismaTransactionStatus.DRAFT;
      case IssueTicketStatus.COMPLETED:
        return PrismaTransactionStatus.CONFIRMED;
      case IssueTicketStatus.CANCELLED:
        return PrismaTransactionStatus.VOIDED;
      default:
        return PrismaTransactionStatus.DRAFT;
    }
  }

  private mapStatusToDomain(
    status: PrismaTransactionStatus,
  ): IssueTicketStatus {
    switch (status) {
      case PrismaTransactionStatus.DRAFT:
        return IssueTicketStatus.DRAFT;
      case PrismaTransactionStatus.CONFIRMED:
        return IssueTicketStatus.COMPLETED;
      case PrismaTransactionStatus.VOIDED:
        return IssueTicketStatus.CANCELLED;
      default:
        return IssueTicketStatus.DRAFT;
    }
  }

  private mapDiscountTypeToPrisma(type: DiscountType): PrismaDiscountType {
    return type as unknown as PrismaDiscountType;
  }

  private mapDiscountTypeToDomain(type: PrismaDiscountType): DiscountType {
    return type as unknown as DiscountType;
  }

  async findById(id: number): Promise<IssueTicketEntity | null> {
    const ticket = await this.prisma.issueTicket.findUnique({
      where: { id },
      include: { lines: true },
    });
    if (!ticket) return null;
    return this.toEntity(ticket);
  }

  async findByCode(code: string): Promise<IssueTicketEntity | null> {
    const ticket = await this.prisma.issueTicket.findUnique({
      where: { ticketNo: code },
      include: { lines: true },
    });
    if (!ticket) return null;
    return this.toEntity(ticket);
  }

  async findAll(): Promise<IssueTicketEntity[]> {
    const tickets = await this.prisma.issueTicket.findMany({
      include: { lines: true },
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
        ticketNo: "desc",
      },
    });

    return ticket ? ticket.ticketNo : null;
  }

  async create(
    ticket: Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<IssueTicketEntity> {
    const newTicket = await this.prisma.issueTicket.create({
      data: {
        ticketNo: ticket.code,
        date: ticket.date,
        customerId: ticket.customerId,
        status: this.mapStatusToPrisma(ticket.status),
        createdBy: ticket.createdBy,
        totalAmount: ticket.totalAmount as unknown as Prisma.Decimal,
        note: ticket.note,
        lines: {
          create: ticket.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity as unknown as Prisma.Decimal,
            unitCode: line.unitCode,
            basePrice: line.basePrice as unknown as Prisma.Decimal,
            discountType: this.mapDiscountTypeToPrisma(line.discountType),
            discountValue: line.discountValue as unknown as Prisma.Decimal,
            finalPrice: line.finalPrice as unknown as Prisma.Decimal,
            lineTotal: line.lineTotal as unknown as Prisma.Decimal,
            originalPrice: line.originalPrice
              ? (line.originalPrice as unknown as Prisma.Decimal)
              : null,
            isOverride: line.isOverride,
          })),
        },
      },
      include: { lines: true },
    });

    return this.toEntity(newTicket);
  }

  async update(
    id: number,
    ticket: Partial<Omit<IssueTicketEntity, "id" | "createdAt" | "updatedAt">>,
  ): Promise<IssueTicketEntity> {
    // We use a transaction to ensure header and lines are updated correctly if lines are provided
    return await this.prisma.$transaction(async (tx) => {
      const { lines, ...headerData } = ticket;

      const updatedTicket = await tx.issueTicket.update({
        where: { id },
        data: {
          ticketNo: headerData.code,
          date: headerData.date,
          customerId: headerData.customerId,
          status: headerData.status
            ? this.mapStatusToPrisma(headerData.status)
            : undefined,
          createdBy: headerData.createdBy,
          totalAmount: headerData.totalAmount as unknown as Prisma.Decimal,
          note: headerData.note,
          ...(lines && {
            lines: {
              deleteMany: {}, // Simple sync strategy: delete all and re-create
              create: lines.map((line) => ({
                productId: line.productId,
                quantity: line.quantity as unknown as Prisma.Decimal,
                unitCode: line.unitCode,
                basePrice: line.basePrice as unknown as Prisma.Decimal,
                discountType: this.mapDiscountTypeToPrisma(line.discountType),
                discountValue: line.discountValue as unknown as Prisma.Decimal,
                finalPrice: line.finalPrice as unknown as Prisma.Decimal,
                lineTotal: line.lineTotal as unknown as Prisma.Decimal,
                originalPrice: line.originalPrice
                  ? (line.originalPrice as unknown as Prisma.Decimal)
                  : null,
                isOverride: line.isOverride,
              })),
            },
          }),
        },
        include: { lines: true },
      });

      return this.toEntity(updatedTicket);
    });
  }

  async complete(id: number, performedBy: number): Promise<IssueTicketEntity> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Fetch current ticket and validate status
      const ticket = await tx.issueTicket.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!ticket) {
        throw new IssueTicketNotFoundException(id);
      }

      if (ticket.status !== PrismaTransactionStatus.DRAFT) {
        throw new InvalidIssueTicketStatusException(ticket.status, "DRAFT");
      }

      // 2. Update status to CONFIRMED (COMPLETED)
      const updatedTicket = await tx.issueTicket.update({
        where: { id },
        data: {
          status: PrismaTransactionStatus.CONFIRMED,
        },
        include: { lines: true },
      });

      // 3. Process each line for stock decrement and movement record
      for (const line of updatedTicket.lines) {
        // Decrease Inventory
        // Note: Inventory.updateQuantity isn't used here because we are in a transaction.
        // We use raw tx client directly like ReceiptTicketRepository did.
        const inventory = await tx.inventory.update({
          where: { productId: line.productId },
          data: {
            quantity: {
              decrement: line.quantity as unknown as Prisma.Decimal,
            },
          },
        });

        // Create Stock Movement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "OUT",
            referenceId: updatedTicket.id,
            referenceType: "ISSUE_TICKET",
            deltaQty: (line.quantity as unknown as Prisma.Decimal).mul(-1),
            qtyAfter: inventory.quantity,
            performedBy,
            note: `Completed Issue Ticket ${updatedTicket.ticketNo}`,
          },
        });
      }

      return this.toEntity(updatedTicket);
    });
  }

  private toEntity(
    prismaTicket: Prisma.IssueTicketGetPayload<{ include: { lines: true } }>,
  ): IssueTicketEntity {
    return new IssueTicketEntity({
      id: prismaTicket.id,
      code: prismaTicket.ticketNo,
      date: prismaTicket.date,
      customerId: prismaTicket.customerId,
      status: this.mapStatusToDomain(prismaTicket.status),
      createdBy: prismaTicket.createdBy,
      totalAmount: new Decimal(prismaTicket.totalAmount.toString()),
      note: prismaTicket.note ?? undefined,
      createdAt: prismaTicket.createdAt,
      updatedAt: prismaTicket.updatedAt,
      lines: (prismaTicket.lines || []).map(
        (line) =>
          new IssueTicketLineEntity({
            id: line.id,
            ticketId: line.ticketId,
            productId: line.productId,
            quantity: new Decimal(line.quantity.toString()),
            unitCode: line.unitCode,
            basePrice: new Decimal(line.basePrice.toString()),
            discountType: this.mapDiscountTypeToDomain(line.discountType),
            discountValue: new Decimal(line.discountValue.toString()),
            finalPrice: new Decimal(line.finalPrice.toString()),
            lineTotal: new Decimal(line.lineTotal.toString()),
            originalPrice: line.originalPrice
              ? new Decimal(line.originalPrice.toString())
              : undefined,
            isOverride: line.isOverride,
            createdAt: line.createdAt,
            updatedAt: line.updatedAt,
          }),
      ),
    });
  }
}

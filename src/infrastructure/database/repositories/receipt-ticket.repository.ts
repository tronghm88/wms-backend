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
import { Decimal } from "decimal.js";

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

  async findWithLines(
    id: number,
  ): Promise<
    (ReceiptTicketEntity & { lines: ReceiptTicketLineEntity[] }) | null
  > {
    const ticket = await this.prisma.receiptTicket.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!ticket) return null;

    const ticketEntity = new ReceiptTicketEntity({
      ...ticket,
      status: ticket.status as unknown as TransactionStatus,
      note: ticket.note ?? undefined,
    });

    const lines = ticket.lines.map(
      (line) =>
        new ReceiptTicketLineEntity({
          ...line,
          quantity: line.quantity,
          lengthM: line.lengthM ?? undefined,
          areaM2: line.areaM2 ?? undefined,
          weightKg: line.weightKg ?? undefined,
        }),
    );

    return Object.assign(ticketEntity, { lines });
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

  async addLineWithStockAdjustment(
    line: Omit<ReceiptTicketLineEntity, "id" | "createdAt" | "updatedAt">,
    performedBy: number,
  ): Promise<ReceiptTicketLineEntity> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Add the line
      const newLine = await tx.receiptTicketLine.create({
        data: {
          ticketId: line.ticketId,
          productId: line.productId,
          quantity: line.quantity as unknown as Prisma.Decimal,
          unitCode: line.unitCode,
          lengthM: line.lengthM as unknown as Prisma.Decimal,
          areaM2: line.areaM2 as unknown as Prisma.Decimal,
          weightKg: line.weightKg as unknown as Prisma.Decimal,
        },
      });

      // 2. Adjust stock
      const inv = await tx.inventory.upsert({
        where: { productId: line.productId },
        update: {
          quantity: {
            increment: line.quantity as unknown as Prisma.Decimal,
          },
        },
        create: {
          productId: line.productId,
          quantity: line.quantity as unknown as Prisma.Decimal,
          unitCode: line.unitCode,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: line.productId,
          txType: "IN",
          referenceId: line.ticketId,
          referenceType: "RECEIPT_TICKET",
          deltaQty: line.quantity as unknown as Prisma.Decimal,
          qtyAfter: inv.quantity,
          performedBy,
          note: `Admin Edit - Line added to confirmed ticket`,
        },
      });

      return new ReceiptTicketLineEntity({
        ...newLine,
        quantity: new Decimal(newLine.quantity.toString()),
        lengthM: newLine.lengthM
          ? new Decimal(newLine.lengthM.toString())
          : undefined,
        areaM2: newLine.areaM2
          ? new Decimal(newLine.areaM2.toString())
          : undefined,
        weightKg: newLine.weightKg
          ? new Decimal(newLine.weightKg.toString())
          : undefined,
      });
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

  async deleteLine(lineId: number): Promise<void> {
    await this.prisma.receiptTicketLine.delete({
      where: { id: lineId },
    });
  }

  async confirm(id: number, performedBy: number): Promise<ReceiptTicketEntity> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Update ticket status to CONFIRMED
      const ticket = await tx.receiptTicket.update({
        where: { id },
        data: {
          status:
            TransactionStatus.CONFIRMED as unknown as PrismaTransactionStatus,
        },
        include: {
          lines: true,
        },
      });

      // 2. Process each line for stock update and movement audit
      for (const line of ticket.lines) {
        // Update or Create Inventory
        const inventory = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              increment: line.quantity as unknown as Prisma.Decimal,
            },
            unitCode: line.unitCode,
          },
          create: {
            productId: line.productId,
            quantity: line.quantity as unknown as Prisma.Decimal,
            unitCode: line.unitCode,
          },
        });

        // Create Stock Movement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "IN",
            referenceId: ticket.id,
            referenceType: "RECEIPT_TICKET",
            deltaQty: line.quantity as unknown as Prisma.Decimal,
            qtyAfter: inventory.quantity,
            performedBy,
            note: `Confirmed Receipt Ticket ${ticket.ticketNo}`,
          },
        });
      }

      return new ReceiptTicketEntity({
        ...ticket,
        status: ticket.status as unknown as TransactionStatus,
        note: ticket.note ?? undefined,
      });
    });
  }

  async updateLineWithStockAdjustment(
    lineId: number,
    line: ReceiptTicketLineEntity,
    oldLine: ReceiptTicketLineEntity,
    performedBy: number,
  ): Promise<ReceiptTicketLineEntity> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Update the line
      const updatedLine = await tx.receiptTicketLine.update({
        where: { id: lineId },
        data: {
          productId: line.productId,
          quantity: line.quantity as unknown as Prisma.Decimal,
          unitCode: line.unitCode,
          lengthM: line.lengthM as unknown as Prisma.Decimal,
          areaM2: line.areaM2 as unknown as Prisma.Decimal,
          weightKg: line.weightKg as unknown as Prisma.Decimal,
        },
      });

      // 2. Adjust stock
      if (oldLine.productId === line.productId) {
        // Same product, adjust by diff
        const diff = line.quantity.minus(oldLine.quantity);
        if (!diff.isZero()) {
          const inv = await tx.inventory.upsert({
            where: { productId: line.productId },
            update: {
              quantity: {
                increment: diff as unknown as Prisma.Decimal,
              },
            },
            create: {
              productId: line.productId,
              quantity: diff as unknown as Prisma.Decimal,
              unitCode: line.unitCode,
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: line.productId,
              txType: "ADJUST",
              referenceId: line.ticketId,
              referenceType: "RECEIPT_TICKET",
              deltaQty: diff as unknown as Prisma.Decimal,
              qtyAfter: inv.quantity,
              performedBy,
              note: `Admin Edit - Line updated`,
            },
          });
        }
      } else {
        // Different product!
        // Revert old product stock
        const oldInv = await tx.inventory.upsert({
          where: { productId: oldLine.productId },
          update: {
            quantity: {
              decrement: oldLine.quantity as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: oldLine.productId,
            quantity: oldLine.quantity.negated() as unknown as Prisma.Decimal,
            unitCode: oldLine.unitCode,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: oldLine.productId,
            txType: "ADJUST",
            referenceId: line.ticketId,
            referenceType: "RECEIPT_TICKET",
            deltaQty: oldLine.quantity.negated() as unknown as Prisma.Decimal,
            qtyAfter: oldInv.quantity,
            performedBy,
            note: `Admin Edit - Product changed (revert old)`,
          },
        });

        // Add new product stock
        const newInv = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              increment: line.quantity as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: line.productId,
            quantity: line.quantity as unknown as Prisma.Decimal,
            unitCode: line.unitCode,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "ADJUST",
            referenceId: line.ticketId,
            referenceType: "RECEIPT_TICKET",
            deltaQty: line.quantity as unknown as Prisma.Decimal,
            qtyAfter: newInv.quantity,
            performedBy,
            note: `Admin Edit - Product changed (add new)`,
          },
        });
      }

      return new ReceiptTicketLineEntity({
        ...updatedLine,
        quantity: new Decimal(updatedLine.quantity.toString()),
        lengthM: updatedLine.lengthM
          ? new Decimal(updatedLine.lengthM.toString())
          : undefined,
        areaM2: updatedLine.areaM2
          ? new Decimal(updatedLine.areaM2.toString())
          : undefined,
        weightKg: updatedLine.weightKg
          ? new Decimal(updatedLine.weightKg.toString())
          : undefined,
      });
    });
  }

  async deleteLineWithStockAdjustment(
    lineId: number,
    oldLine: ReceiptTicketLineEntity,
    performedBy: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete line
      await tx.receiptTicketLine.delete({
        where: { id: lineId },
      });

      // 2. Revert stock
      const inv = await tx.inventory.upsert({
        where: { productId: oldLine.productId },
        update: {
          quantity: {
            decrement: oldLine.quantity as unknown as Prisma.Decimal,
          },
        },
        create: {
          productId: oldLine.productId,
          quantity: oldLine.quantity.negated() as unknown as Prisma.Decimal,
          unitCode: oldLine.unitCode,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: oldLine.productId,
          txType: "ADJUST",
          referenceId: oldLine.ticketId,
          referenceType: "RECEIPT_TICKET",
          deltaQty: oldLine.quantity.negated() as unknown as Prisma.Decimal,
          qtyAfter: inv.quantity,
          performedBy,
          note: `Admin Edit - Line deleted`,
        },
      });
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.receiptTicketLine.deleteMany({
        where: { ticketId: id },
      });
      await tx.receiptTicket.delete({
        where: { id },
      });
    });
  }

  async deleteWithStockAdjustment(
    id: number,
    performedBy: number,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Find ticket with lines
      const ticket = await tx.receiptTicket.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!ticket) return;

      // 2. Revert stock for each line
      for (const line of ticket.lines) {
        const inv = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              decrement: line.quantity as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: line.productId,
            quantity: line.quantity.negated() as unknown as Prisma.Decimal,
            unitCode: line.unitCode,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "ADJUST",
            referenceId: ticket.id,
            referenceType: "RECEIPT_TICKET",
            deltaQty: line.quantity.negated() as unknown as Prisma.Decimal,
            qtyAfter: inv.quantity,
            performedBy,
            note: `Admin Delete - Confirmed Receipt Ticket deleted`,
          },
        });
      }

      // 3. Delete lines and ticket
      await tx.receiptTicketLine.deleteMany({
        where: { ticketId: id },
      });
      await tx.receiptTicket.delete({
        where: { id },
      });
    });
  }
}

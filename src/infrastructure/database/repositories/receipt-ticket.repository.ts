import {
  Prisma,
  TransactionStatus as PrismaTransactionStatus,
  StockMovementType as PrismaStockMovementType,
} from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotConfirmedException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";
import { Injectable } from "@nestjs/common";
import { Decimal } from "decimal.js";
import { ReceiptStatsDto } from "../../../application/dtos/receipt-stats.dto";
import { UnitConversionEngine } from "../../../domain/services/unit-conversion-engine";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";

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
      note: ticket.note ?? null,
      supplierName: ticket.supplierName ?? null,
      invoiceNo: ticket.invoiceNo ?? null,
      invoiceDate: ticket.invoiceDate ?? null,
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
        lines: {
          include: {
            product: {
              select: {
                name: true,
                code: true,
              },
            },
            unit: {
              select: {
                label: true,
              },
            },
          },
        },
        creator: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            lines: true,
          },
        },
      },
    });

    if (!ticket) return null;

    const ticketEntity = new ReceiptTicketEntity({
      ...ticket,
      status: ticket.status as unknown as TransactionStatus,
      note: ticket.note ?? null,
      supplierName: ticket.supplierName ?? null,
      invoiceNo: ticket.invoiceNo ?? null,
      invoiceDate: ticket.invoiceDate ?? null,
      createdByName: ticket.creator.fullName,
      totalLines: ticket._count.lines,
      totalQuantity: null,
    });

    const lines = ticket.lines.map(
      (line) =>
        new ReceiptTicketLineEntity({
          ...line,
          quantity: line.quantity,
          lengthM: line.lengthM,
          areaM2: line.areaM2,
          weightKg: line.weightKg,
          unitCost: line.unitCost,
          note: line.note ?? null,
          productName: line.product.name,
          productCode: line.product.code,
          unitLabel: line.unit.label,
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
      note: ticket.note ?? null,
      supplierName: ticket.supplierName ?? null,
      invoiceNo: ticket.invoiceNo ?? null,
      invoiceDate: ticket.invoiceDate ?? null,
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
          note: t.note ?? null,
          supplierName: t.supplierName ?? null,
          invoiceNo: t.invoiceNo ?? null,
          invoiceDate: t.invoiceDate ?? null,
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
        include: {
          creator: {
            select: {
              fullName: true,
            },
          },
          _count: {
            select: {
              lines: true,
            },
          },
        },
      }),
      this.prisma.receiptTicket.count({ where }),
    ]);

    return {
      items: items.map(
        (t) =>
          new ReceiptTicketEntity({
            ...t,
            status: t.status as unknown as TransactionStatus,
            note: t.note ?? null,
            supplierName: t.supplierName ?? null,
            invoiceNo: t.invoiceNo ?? null,
            invoiceDate: t.invoiceDate ?? null,
            createdByName: t.creator.fullName,
            totalLines: t._count.lines,
            totalQuantity: null,
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
    lines?: Omit<
      ReceiptTicketLineEntity,
      "id" | "ticketId" | "createdAt" | "updatedAt"
    >[],
  ): Promise<ReceiptTicketEntity> {
    const data: Prisma.ReceiptTicketUncheckedCreateInput = {
      ticketNo: ticket.ticketNo,
      date: ticket.date,
      status: ticket.status as unknown as PrismaTransactionStatus,
      createdBy: ticket.createdBy,
      note: ticket.note,
      supplierName: ticket.supplierName,
      invoiceNo: ticket.invoiceNo,
      invoiceDate: ticket.invoiceDate,
    };

    if (lines && lines.length > 0) {
      data.lines = {
        create: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity as unknown as Prisma.Decimal,
          unitCode: line.unitCode,
          lengthM: line.lengthM as unknown as Prisma.Decimal,
          areaM2: line.areaM2 as unknown as Prisma.Decimal,
          weightKg: line.weightKg as unknown as Prisma.Decimal,
          unitCost: line.unitCost as unknown as Prisma.Decimal,
          note: line.note,
        })),
      };
    }

    const newTicket = await this.prisma.receiptTicket.create({
      data,
      include: {
        lines: {
          include: {
            product: { select: { name: true, code: true } },
            unit: { select: { label: true } },
          },
        },
      },
    });

    const entity = new ReceiptTicketEntity({
      ...newTicket,
      status: newTicket.status as unknown as TransactionStatus,
      note: newTicket.note ?? null,
      supplierName: newTicket.supplierName ?? null,
      invoiceNo: newTicket.invoiceNo ?? null,
      invoiceDate: newTicket.invoiceDate ?? null,
    });

    if (newTicket.lines && newTicket.lines.length > 0) {
      const lineEntities = newTicket.lines.map(
        (line) =>
          new ReceiptTicketLineEntity({
            ...line,
            quantity: new Decimal(line.quantity.toString()),
            lengthM: line.lengthM ? new Decimal(line.lengthM.toString()) : null,
            areaM2: line.areaM2 ? new Decimal(line.areaM2.toString()) : null,
            weightKg: line.weightKg
              ? new Decimal(line.weightKg.toString())
              : null,
            unitCost: line.unitCost
              ? new Decimal(line.unitCost.toString())
              : null,
            note: line.note ?? null,
            productName: line.product.name,
            productCode: line.product.code,
            unitLabel: line.unit.label,
          }),
      );
      return Object.assign(entity, { lines: lineEntities });
    }

    return entity;
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
        supplierName: ticket.supplierName,
        invoiceNo: ticket.invoiceNo,
        invoiceDate: ticket.invoiceDate,
      },
    });

    return new ReceiptTicketEntity({
      ...updatedTicket,
      status: updatedTicket.status as unknown as TransactionStatus,
      note: updatedTicket.note ?? null,
      supplierName: updatedTicket.supplierName ?? null,
      invoiceNo: updatedTicket.invoiceNo ?? null,
      invoiceDate: updatedTicket.invoiceDate ?? null,
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
        unitCost: line.unitCost as unknown as Prisma.Decimal,
        note: line.note,
      },
      include: {
        product: { select: { name: true, code: true } },
        unit: { select: { label: true } },
      },
    });

    return new ReceiptTicketLineEntity({
      ...newLine,
      quantity: newLine.quantity,
      lengthM: newLine.lengthM,
      areaM2: newLine.areaM2,
      weightKg: newLine.weightKg,
      unitCost: newLine.unitCost,
      note: newLine.note ?? null,
      productName: newLine.product.name,
      productCode: newLine.product.code,
      unitLabel: newLine.unit.label,
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
          unitCost: line.unitCost as unknown as Prisma.Decimal,
          note: line.note,
        },
        include: {
          product: { select: { name: true, code: true } },
          unit: { select: { label: true } },
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
          unitCost: line.unitCost as unknown as Prisma.Decimal,
          note: `Admin Edit - Line added to confirmed ticket`,
        },
      });

      return new ReceiptTicketLineEntity({
        ...newLine,
        quantity: new Decimal(newLine.quantity.toString()),
        lengthM: newLine.lengthM
          ? new Decimal(newLine.lengthM.toString())
          : null,
        areaM2: newLine.areaM2 ? new Decimal(newLine.areaM2.toString()) : null,
        weightKg: newLine.weightKg
          ? new Decimal(newLine.weightKg.toString())
          : null,
        unitCost: newLine.unitCost
          ? new Decimal(newLine.unitCost.toString())
          : null,
        note: newLine.note ?? null,
        productName: newLine.product.name,
        productCode: newLine.product.code,
        unitLabel: newLine.unit.label,
      });
    });
  }

  async findLineById(lineId: number): Promise<ReceiptTicketLineEntity | null> {
    const line = await this.prisma.receiptTicketLine.findUnique({
      where: { id: lineId },
      include: {
        product: { select: { name: true, code: true } },
        unit: { select: { label: true } },
      },
    });
    if (!line) return null;
    return new ReceiptTicketLineEntity({
      ...line,
      quantity: line.quantity,
      lengthM: line.lengthM,
      areaM2: line.areaM2,
      weightKg: line.weightKg,
      unitCost: line.unitCost,
      note: line.note ?? null,
      productName: line.product.name,
      productCode: line.product.code,
      unitLabel: line.unit.label,
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
        unitCost: line.unitCost as unknown as Prisma.Decimal,
        note: line.note,
      },
      include: {
        product: { select: { name: true, code: true } },
        unit: { select: { label: true } },
      },
    });

    return new ReceiptTicketLineEntity({
      ...updatedLine,
      quantity: updatedLine.quantity,
      lengthM: updatedLine.lengthM,
      areaM2: updatedLine.areaM2,
      weightKg: updatedLine.weightKg,
      unitCost: updatedLine.unitCost,
      note: updatedLine.note ?? null,
      productName: updatedLine.product.name,
      productCode: updatedLine.product.code,
      unitLabel: updatedLine.unit.label,
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
        const { baseQuantity, baseUnit } = await this.calculateBaseQuantity(
          tx,
          line.productId,
          new Decimal(line.quantity as unknown as Prisma.Decimal),
          line.unitCode,
        );

        // Update or Create Inventory
        const inventory = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              increment: baseQuantity as unknown as Prisma.Decimal,
            },
            unitCode: baseUnit,
          },
          create: {
            productId: line.productId,
            quantity: baseQuantity as unknown as Prisma.Decimal,
            unitCode: baseUnit,
          },
        });

        // Create Stock Movement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "IN",
            referenceId: ticket.id,
            referenceType: "RECEIPT_TICKET",
            deltaQty: baseQuantity as unknown as Prisma.Decimal,
            qtyAfter: inventory.quantity,
            performedBy,
            unitCost: line.unitCost as unknown as Prisma.Decimal,
            note: `Confirmed Receipt Ticket ${ticket.ticketNo}`,
          },
        });
      }

      return new ReceiptTicketEntity({
        ...ticket,
        status: ticket.status as unknown as TransactionStatus,
        note: ticket.note ?? null,
        supplierName: ticket.supplierName ?? null,
        invoiceNo: ticket.invoiceNo ?? null,
        invoiceDate: ticket.invoiceDate ?? null,
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
          unitCost: line.unitCost as unknown as Prisma.Decimal,
          note: line.note,
        },
        include: {
          product: { select: { name: true, code: true } },
          unit: { select: { label: true } },
        },
      });

      // 2. Adjust stock
      if (oldLine.productId === line.productId) {
        // Same product, adjust by diff
        const { baseQuantity: newBaseQty, baseUnit } =
          await this.calculateBaseQuantity(
            tx,
            line.productId,
            line.quantity,
            line.unitCode,
          );
        const { baseQuantity: oldBaseQty } = await this.calculateBaseQuantity(
          tx,
          oldLine.productId,
          oldLine.quantity,
          oldLine.unitCode,
        );

        const diff = newBaseQty.minus(oldBaseQty);
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
              unitCode: baseUnit,
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
              unitCost: line.unitCost as unknown as Prisma.Decimal,
              note: `Admin Edit - Line updated`,
            },
          });
        }
      } else {
        // Different product!
        const { baseQuantity: oldBaseQty, baseUnit: oldBaseUnit } =
          await this.calculateBaseQuantity(
            tx,
            oldLine.productId,
            oldLine.quantity,
            oldLine.unitCode,
          );
        const { baseQuantity: newBaseQty, baseUnit: newBaseUnit } =
          await this.calculateBaseQuantity(
            tx,
            line.productId,
            line.quantity,
            line.unitCode,
          );

        // Revert old product stock
        const oldInv = await tx.inventory.upsert({
          where: { productId: oldLine.productId },
          update: {
            quantity: {
              decrement: oldBaseQty as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: oldLine.productId,
            quantity: oldBaseQty.negated() as unknown as Prisma.Decimal,
            unitCode: oldBaseUnit,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: oldLine.productId,
            txType: "ADJUST",
            referenceId: line.ticketId,
            referenceType: "RECEIPT_TICKET",
            deltaQty: oldBaseQty.negated() as unknown as Prisma.Decimal,
            qtyAfter: oldInv.quantity,
            performedBy,
            unitCost: oldLine.unitCost as unknown as Prisma.Decimal,
            note: `Admin Edit - Product changed (revert old)`,
          },
        });

        // Add new product stock
        const newInv = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              increment: newBaseQty as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: line.productId,
            quantity: newBaseQty as unknown as Prisma.Decimal,
            unitCode: newBaseUnit,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "ADJUST",
            referenceId: line.ticketId,
            referenceType: "RECEIPT_TICKET",
            deltaQty: newBaseQty as unknown as Prisma.Decimal,
            qtyAfter: newInv.quantity,
            performedBy,
            unitCost: line.unitCost as unknown as Prisma.Decimal,
            note: `Admin Edit - Product changed (add new)`,
          },
        });
      }

      return new ReceiptTicketLineEntity({
        ...updatedLine,
        quantity: new Decimal(updatedLine.quantity.toString()),
        lengthM: updatedLine.lengthM
          ? new Decimal(updatedLine.lengthM.toString())
          : null,
        areaM2: updatedLine.areaM2
          ? new Decimal(updatedLine.areaM2.toString())
          : null,
        weightKg: updatedLine.weightKg
          ? new Decimal(updatedLine.weightKg.toString())
          : null,
        unitCost: updatedLine.unitCost
          ? new Decimal(updatedLine.unitCost.toString())
          : null,
        note: updatedLine.note ?? null,
        productName: updatedLine.product.name,
        productCode: updatedLine.product.code,
        unitLabel: updatedLine.unit.label,
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
      const { baseQuantity: oldBaseQty, baseUnit: oldBaseUnit } =
        await this.calculateBaseQuantity(
          tx,
          oldLine.productId,
          oldLine.quantity,
          oldLine.unitCode,
        );

      const inv = await tx.inventory.upsert({
        where: { productId: oldLine.productId },
        update: {
          quantity: {
            decrement: oldBaseQty as unknown as Prisma.Decimal,
          },
        },
        create: {
          productId: oldLine.productId,
          quantity: oldBaseQty.negated() as unknown as Prisma.Decimal,
          unitCode: oldBaseUnit,
        },
      });

      await tx.stockMovement.create({
        data: {
          productId: oldLine.productId,
          txType: "ADJUST",
          referenceId: oldLine.ticketId,
          referenceType: "RECEIPT_TICKET",
          deltaQty: oldBaseQty.negated() as unknown as Prisma.Decimal,
          qtyAfter: inv.quantity,
          performedBy,
          unitCost: oldLine.unitCost as unknown as Prisma.Decimal,
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
        const { baseQuantity, baseUnit } = await this.calculateBaseQuantity(
          tx,
          line.productId,
          new Decimal(line.quantity as unknown as Prisma.Decimal),
          line.unitCode,
        );

        const inv = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              decrement: baseQuantity as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: line.productId,
            quantity: baseQuantity.negated() as unknown as Prisma.Decimal,
            unitCode: baseUnit,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: "ADJUST",
            referenceId: ticket.id,
            referenceType: "RECEIPT_TICKET",
            deltaQty: baseQuantity.negated() as unknown as Prisma.Decimal,
            qtyAfter: inv.quantity,
            performedBy,
            unitCost: line.unitCost as unknown as Prisma.Decimal,
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

  async cancel(
    id: number,
    performedBy: number,
  ): Promise<{ ticket: ReceiptTicketEntity; warnings: string[] }> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Find ticket with lines and products
      const ticket = await tx.receiptTicket.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new ReceiptTicketNotFoundException(id);
      }

      if (ticket.status !== PrismaTransactionStatus.CONFIRMED) {
        throw new ReceiptTicketNotConfirmedException(id);
      }

      const warnings: string[] = [];

      // 2. Update ticket status to CANCELLED
      const updatedTicket = await tx.receiptTicket.update({
        where: { id },
        data: {
          status:
            TransactionStatus.CANCELLED as unknown as PrismaTransactionStatus,
        },
      });

      // 3. Revert stock for each line
      for (const line of ticket.lines) {
        const { baseQuantity, baseUnit } = await this.calculateBaseQuantity(
          tx,
          line.productId,
          new Decimal(line.quantity as unknown as Prisma.Decimal),
          line.unitCode,
        );

        const inv = await tx.inventory.upsert({
          where: { productId: line.productId },
          update: {
            quantity: {
              decrement: baseQuantity as unknown as Prisma.Decimal,
            },
          },
          create: {
            productId: line.productId,
            quantity: baseQuantity.negated() as unknown as Prisma.Decimal,
            unitCode: baseUnit,
          },
        });

        // Check for negative stock
        if (inv.quantity.lt(0)) {
          warnings.push(
            `Negative stock for product ${line.product.code}: ${inv.quantity.toString()}`,
          );
        }

        // Create Stock Movement record
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            txType: PrismaStockMovementType.ADJUST,
            referenceId: ticket.id,
            referenceType: "RECEIPT_TICKET",
            deltaQty: baseQuantity.negated() as unknown as Prisma.Decimal,
            qtyAfter: inv.quantity,
            performedBy,
            unitCost: line.unitCost as unknown as Prisma.Decimal,
            note: `Cancelled Receipt Ticket ${ticket.ticketNo}`,
          },
        });
      }

      return {
        ticket: new ReceiptTicketEntity({
          ...updatedTicket,
          status: updatedTicket.status as unknown as TransactionStatus,
          note: updatedTicket.note ?? null,
          supplierName: updatedTicket.supplierName ?? null,
          invoiceNo: updatedTicket.invoiceNo ?? null,
          invoiceDate: updatedTicket.invoiceDate ?? null,
        }),
        warnings,
      };
    });
  }

  async getStats(from: Date, to: Date): Promise<ReceiptStatsDto> {
    const where: Prisma.ReceiptTicketWhereInput = {
      date: {
        gte: from,
        lte: to,
      },
    };

    const [totalCount, pendingCount, lineCount] = await Promise.all([
      this.prisma.receiptTicket.count({ where }),
      this.prisma.receiptTicket.count({
        where: {
          ...where,
          status: PrismaTransactionStatus.DRAFT,
        },
      }),
      this.prisma.receiptTicketLine.count({
        where: {
          ticket: where,
        },
      }),
    ]);

    return {
      totalCount,
      totalLines: lineCount,
      pendingCount,
      totalInbound: "0",
    };
  }

  private async calculateBaseQuantity(
    tx: Prisma.TransactionClient,
    productId: number,
    quantity: Decimal,
    unitCode: string,
  ): Promise<{ baseQuantity: Decimal; baseUnit: string }> {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { unitConversions: true },
    });
    if (!product) throw new Error(`Product ${productId} not found`);

    const baseUnit = product.baseUnit;
    if (unitCode === baseUnit) {
      return { baseQuantity: quantity, baseUnit };
    }

    const conversions = product.unitConversions.map(
      (c) =>
        new UnitConversionEntity({
          ...c,
          factor: new Decimal(c.factor),
        }),
    );
    const converted = UnitConversionEngine.convertToUnit(
      quantity,
      unitCode,
      baseUnit,
      conversions,
    );
    if (!converted) {
      throw new Error(
        `Cannot convert ${unitCode} to ${baseUnit} for product ${productId}`,
      );
    }
    return { baseQuantity: converted, baseUnit };
  }
}

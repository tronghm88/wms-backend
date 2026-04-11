import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IStockMovementRepository } from "../../../domain/contracts/stock-movement.repository.interface";
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
        note: movement.note,
      },
    });

    return this.mapToEntity(newMovement);
  }

  private mapToEntity(m: PrismaStockMovement): StockMovementEntity {
    return new StockMovementEntity(
      m.id,
      m.productId,
      m.txType as StockMovementType,
      m.referenceId,
      m.referenceType,
      new Decimal(m.deltaQty.toString()),
      new Decimal(m.qtyAfter.toString()),
      m.performedBy,
      m.note,
      m.createdAt,
    );
  }
}

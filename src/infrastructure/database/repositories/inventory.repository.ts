import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IInventoryRepository } from "../../../domain/contracts/inventory.repository.interface";
import { InventoryEntity } from "../../../domain/entities/inventory.entity";
import { Decimal } from "decimal.js";
import { Prisma } from "@prisma/client";

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: number): Promise<InventoryEntity | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });
    if (!inventory) return null;
    return new InventoryEntity({
      ...inventory,
      quantity: new Decimal(inventory.quantity.toString()),
    });
  }

  async findAll(): Promise<InventoryEntity[]> {
    const inventories = await this.prisma.inventory.findMany();
    return inventories.map(
      (inv) =>
        new InventoryEntity({
          ...inv,
          quantity: new Decimal(inv.quantity.toString()),
        }),
    );
  }

  async updateQuantity(
    productId: number,
    delta: Decimal,
    unitCode: string,
  ): Promise<InventoryEntity> {
    const inventory = await this.prisma.inventory.upsert({
      where: { productId },
      update: {
        quantity: {
          increment: delta as unknown as Prisma.Decimal,
        },
      },
      create: {
        productId,
        quantity: delta as unknown as Prisma.Decimal,
        unitCode,
      },
    });

    return new InventoryEntity({
      ...inventory,
      quantity: new Decimal(inventory.quantity.toString()),
    });
  }
}

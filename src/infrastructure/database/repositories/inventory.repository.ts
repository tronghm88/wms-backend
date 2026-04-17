import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  IInventoryRepository,
  InventorySnapshotItem,
} from "../../../domain/contracts/inventory.repository.interface";
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

  async findAllActiveStock(): Promise<InventorySnapshotItem[]> {
    const stocks = await this.prisma.inventory.findMany({
      where: {
        quantity: {
          gt: 0,
        },
      },
      select: {
        productId: true,
        quantity: true,
        unitCode: true,
        lastUpdated: true,
        product: {
          select: {
            code: true,
            name: true,
            length: true,
            width: true,
            height: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return stocks.map((stock) => ({
      productId: stock.productId,
      productCode: stock.product.code,
      productName: stock.product.name,
      categoryName: stock.product.category.name,
      quantity: new Decimal(stock.quantity.toString()),
      unitCode: stock.unitCode,
      length: stock.product.length
        ? new Decimal(stock.product.length.toString())
        : undefined,
      width: stock.product.width
        ? new Decimal(stock.product.width.toString())
        : undefined,
      height: stock.product.height
        ? new Decimal(stock.product.height.toString())
        : undefined,
      lastUpdated: stock.lastUpdated,
    }));
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

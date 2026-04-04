import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Product as PrismaProduct } from "@prisma/client";
import { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { Decimal } from "decimal.js";

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(product: PrismaProduct): ProductEntity {
    return new ProductEntity({
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      baseUnit: product.baseUnit,
      basePrice: new Decimal(product.basePrice.toString()),
      length: product.length
        ? new Decimal(product.length.toString())
        : undefined,
      width: product.width ? new Decimal(product.width.toString()) : undefined,
      height: product.height
        ? new Decimal(product.height.toString())
        : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;
    return this.mapToDomain(product);
  }

  async findByCode(code: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { code },
    });

    if (!product) return null;
    return this.mapToDomain(product);
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany();
    return products.map((p) => this.mapToDomain(p));
  }

  async create(
    product: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProductEntity> {
    const created = await this.prisma.product.create({
      data: {
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        baseUnit: product.baseUnit,
        basePrice: product.basePrice.toString(),
        length: product.length?.toString(),
        width: product.width?.toString(),
        height: product.height?.toString(),
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: number,
    product: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        baseUnit: product.baseUnit,
        basePrice: product.basePrice?.toString(),
        length: product.length?.toString(),
        width: product.width?.toString(),
        height: product.height?.toString(),
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}

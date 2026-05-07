import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Category as PrismaCategory } from "@prisma/client";
import { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryEntity } from "../../../domain/entities/category.entity";

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(
    category: PrismaCategory & { unit?: { label: string } | null },
  ): CategoryEntity {
    return new CategoryEntity({
      id: category.id,
      code: category.code,
      name: category.name,
      baseUnit: category.baseUnit ?? undefined,
      additionalUnits: category.additionalUnits,
      baseUnitLabel: category.unit?.label,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;
    return this.mapToDomain(category);
  }

  async findByCode(code: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { code },
    });

    if (!category) return null;
    return this.mapToDomain(category);
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany();
    return categories.map((c) => this.mapToDomain(c));
  }

  async create(
    category: Omit<
      CategoryEntity,
      "id" | "createdAt" | "updatedAt" | "products" | "sizes" | "baseUnitLabel"
    >,
  ): Promise<CategoryEntity> {
    const created = await this.prisma.category.create({
      data: {
        code: category.code,
        name: category.name,
        baseUnit: category.baseUnit,
        additionalUnits: category.additionalUnits,
      },
    });
    return this.mapToDomain(created);
  }

  async update(
    id: number,
    category: Partial<CategoryEntity>,
  ): Promise<CategoryEntity> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        code: category.code,
        name: category.name,
        baseUnit: category.baseUnit,
        additionalUnits: category.additionalUnits,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async hasProducts(id: number): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  }

  async hasSizes(id: number): Promise<boolean> {
    const count = await this.prisma.categorySize.count({
      where: { categoryId: id },
    });
    return count > 0;
  }

  async findByIdWithUnits(id: number): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { unit: true },
    });
    if (!category) return null;
    return this.mapToDomain(category);
  }

  async hasConfirmedTransactions(categoryId: number): Promise<boolean> {
    const receiptLinesCount = await this.prisma.receiptTicketLine.count({
      where: {
        product: { categoryId },
        ticket: { status: "CONFIRMED" },
      },
    });
    if (receiptLinesCount > 0) return true;

    const issueLinesCount = await this.prisma.issueTicketLine.count({
      where: {
        product: { categoryId },
        ticket: { status: "CONFIRMED" },
      },
    });
    return issueLinesCount > 0;
  }

  async updateProductsBaseUnit(
    categoryId: number,
    baseUnit: string,
  ): Promise<void> {
    await this.prisma.product.updateMany({
      where: { categoryId },
      data: { baseUnit },
    });
  }

  async deleteProductsUnitConversions(categoryId: number): Promise<void> {
    await this.prisma.unitConversion.deleteMany({
      where: {
        product: { categoryId },
      },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Category as PrismaCategory } from "@prisma/client";
import { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryEntity } from "../../../domain/entities/category.entity";

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(category: PrismaCategory): CategoryEntity {
    return new CategoryEntity({
      id: category.id,
      code: category.code,
      name: category.name,
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
      "id" | "createdAt" | "updatedAt" | "products" | "sizes"
    >,
  ): Promise<CategoryEntity> {
    const created = await this.prisma.category.create({
      data: {
        code: category.code,
        name: category.name,
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
}

import { CategoryEntity } from "../entities/category.entity";

export const CATEGORY_REPOSITORY = "CATEGORY_REPOSITORY";

export interface ICategoryRepository {
  findById(id: number): Promise<CategoryEntity | null>;
  findByCode(code: string): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  create(
    category: Omit<
      CategoryEntity,
      "id" | "createdAt" | "updatedAt" | "products" | "sizes" | "baseUnitLabel"
    >,
  ): Promise<CategoryEntity>;
  update(
    id: number,
    category: Partial<CategoryEntity>,
  ): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
  hasProducts(id: number): Promise<boolean>;
  hasSizes(id: number): Promise<boolean>;
  findByIdWithUnits(id: number): Promise<CategoryEntity | null>;
  hasConfirmedTransactions(categoryId: number): Promise<boolean>;
  updateProductsBaseUnit(categoryId: number, baseUnit: string): Promise<void>;
  deleteProductsUnitConversions(categoryId: number): Promise<void>;
}

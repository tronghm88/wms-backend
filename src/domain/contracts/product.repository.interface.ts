import { ProductEntity } from "../entities/product.entity";
import { ProductLineageEntity } from "../entities/product-lineage.entity";

export const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";

export interface IProductRepository {
  findById(id: number): Promise<ProductEntity | null>;
  findByIds(ids: number[]): Promise<ProductEntity[]>;
  findByCode(code: string): Promise<ProductEntity | null>;
  findAll(): Promise<ProductEntity[]>;
  create(
    product: Omit<ProductEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProductEntity>;
  update(id: number, product: Partial<ProductEntity>): Promise<ProductEntity>;
  delete(id: number): Promise<void>;
  hasHistory(id: number): Promise<boolean>;
  findLineage(id: number): Promise<ProductLineageEntity | null>;
}

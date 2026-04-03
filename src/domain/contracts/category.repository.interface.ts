import { CategoryEntity } from '../entities/category.entity';

export interface ICategoryRepository {
  findById(id: number): Promise<CategoryEntity | null>;
  findByCode(code: string): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  create(category: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt' | 'products' | 'sizes'>): Promise<CategoryEntity>;
  update(id: number, category: Partial<CategoryEntity>): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
}

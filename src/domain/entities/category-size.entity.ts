export class CategorySizeEntity {
  id: number;
  categoryId: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CategorySizeEntity>) {
    Object.assign(this, partial);
  }
}

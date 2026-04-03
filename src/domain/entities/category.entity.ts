export class CategoryEntity {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}

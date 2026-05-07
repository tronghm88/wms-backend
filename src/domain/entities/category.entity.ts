export class CategoryEntity {
  id: number;
  code: string;
  name: string;
  baseUnit?: string | null;
  additionalUnits?: string[];
  baseUnitLabel?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}

import { Decimal } from "decimal.js";

export class ProductEntity {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  basePrice: Decimal;
  length: Decimal | null;
  width: Decimal | null;
  height: Decimal | null;
  description?: string | null;
  specText?: string | null;
  costPrice?: Decimal | null;
  reorderThreshold: Decimal;
  parentProductId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ProductEntity>) {
    Object.assign(this, partial);
    if (partial?.basePrice) this.basePrice = new Decimal(partial.basePrice);
    this.length = partial?.length ? new Decimal(partial.length) : null;
    this.width = partial?.width ? new Decimal(partial.width) : null;
    this.height = partial?.height ? new Decimal(partial.height) : null;
    if (partial?.costPrice) this.costPrice = new Decimal(partial.costPrice);
    if (partial?.reorderThreshold !== undefined)
      this.reorderThreshold = new Decimal(partial.reorderThreshold);
    else if (!this.reorderThreshold) this.reorderThreshold = new Decimal(0);
  }
}

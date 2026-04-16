import { Decimal } from "decimal.js";

export class ProductEntity {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  basePrice: Decimal;
  length?: Decimal;
  width?: Decimal;
  height?: Decimal;
  parentProductId?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ProductEntity>) {
    Object.assign(this, partial);
    if (partial?.basePrice) this.basePrice = new Decimal(partial.basePrice);
    if (partial?.length) this.length = new Decimal(partial.length);
    if (partial?.width) this.width = new Decimal(partial.width);
    if (partial?.height) this.height = new Decimal(partial.height);
  }
}

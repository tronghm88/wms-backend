import { Decimal } from "decimal.js";

export class UnitConversionEntity {
  id: number;
  productId: number;
  fromUnit: string;
  toUnit: string;
  factor: Decimal;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<UnitConversionEntity>) {
    Object.assign(this, partial);
    if (partial?.factor) {
      this.factor = new Decimal(partial.factor);
    }
  }
}

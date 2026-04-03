import { Decimal } from "decimal.js";

export class InventoryEntity {
  productId: number;
  quantity: Decimal;
  unitCode: string;
  lastUpdated: Date;

  constructor(partial?: Partial<InventoryEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
  }
}

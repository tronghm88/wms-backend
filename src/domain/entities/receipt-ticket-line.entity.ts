import { Decimal } from "decimal.js";

export class ReceiptTicketLineEntity {
  id: number;
  ticketId: number;
  productId: number;
  quantity: Decimal;
  unitCode: string;
  lengthM?: Decimal;
  areaM2?: Decimal;
  weightKg?: Decimal;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ReceiptTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
    if (partial?.lengthM) {
      this.lengthM = new Decimal(partial.lengthM);
    }
    if (partial?.areaM2) {
      this.areaM2 = new Decimal(partial.areaM2);
    }
    if (partial?.weightKg) {
      this.weightKg = new Decimal(partial.weightKg);
    }
  }
}

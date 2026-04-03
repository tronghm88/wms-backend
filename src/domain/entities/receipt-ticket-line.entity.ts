import { Decimal } from "decimal.js";

export class ReceiptTicketLineEntity {
  id: number;
  ticketId: number;
  productId: number;
  quantity: Decimal;
  unitCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ReceiptTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
  }
}

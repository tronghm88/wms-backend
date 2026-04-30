import { Decimal } from "decimal.js";

export class SplitTicketLineEntity {
  id: number;
  ticketId: number;
  targetProductId: number;
  quantity: Decimal;
  unitCode: string;
  isNewProduct: boolean;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<SplitTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
    this.note = partial?.note ?? null;
  }
}

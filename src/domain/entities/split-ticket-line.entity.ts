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

  // Enrichment fields (populated when fetched with product join)
  targetProductName?: string;
  productWidth?: Decimal;
  productLength?: Decimal;
  productHeight?: Decimal;
  unitLabel?: string;

  constructor(partial?: Partial<SplitTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
    if (partial?.productWidth) {
      this.productWidth = new Decimal(partial.productWidth);
    }
    if (partial?.productLength) {
      this.productLength = new Decimal(partial.productLength);
    }
    if (partial?.productHeight) {
      this.productHeight = new Decimal(partial.productHeight);
    }
    this.note = partial?.note ?? null;
  }
}

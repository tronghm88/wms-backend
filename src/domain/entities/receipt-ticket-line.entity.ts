import { Decimal } from "decimal.js";

export class ReceiptTicketLineEntity {
  id: number;
  ticketId: number;
  productId: number;
  quantity: Decimal;
  unitCode: string;
  lengthM: Decimal | null;
  areaM2: Decimal | null;
  weightKg: Decimal | null;
  unitCost: Decimal | null;
  note: string | null;
  productName?: string;
  productCode?: string;
  productWidth?: Decimal | null;
  productHeight?: Decimal | null;
  productLength?: Decimal | null;
  unitLabel?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ReceiptTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) {
      this.quantity = new Decimal(partial.quantity);
    }
    this.lengthM = partial?.lengthM ? new Decimal(partial.lengthM) : null;
    this.areaM2 = partial?.areaM2 ? new Decimal(partial.areaM2) : null;
    this.weightKg = partial?.weightKg ? new Decimal(partial.weightKg) : null;
    this.unitCost = partial?.unitCost ? new Decimal(partial.unitCost) : null;
    this.note = partial?.note ?? null;
  }
}

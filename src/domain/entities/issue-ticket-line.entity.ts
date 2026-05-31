import { Decimal } from "decimal.js";
import { DiscountType } from "../enums";

export class IssueTicketLineEntity {
  id: number;
  ticketId: number;
  productId: number;
  quantity: Decimal;
  unitCode: string;
  basePrice: Decimal;
  discountType: DiscountType;
  discountValue: Decimal;
  finalPrice: Decimal;
  lineTotal: Decimal;
  originalPrice?: Decimal;
  isOverride: boolean = false;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;

  /** Enrichment fields — populated from the product join, not stored on the line */
  productName?: string;
  productWidth?: Decimal | null;
  productHeight?: Decimal | null;

  constructor(partial?: Partial<IssueTicketLineEntity>) {
    Object.assign(this, partial);
    if (partial?.quantity) this.quantity = new Decimal(partial.quantity);
    if (partial?.basePrice) this.basePrice = new Decimal(partial.basePrice);
    if (partial?.discountValue)
      this.discountValue = new Decimal(partial.discountValue);
    if (partial?.finalPrice) this.finalPrice = new Decimal(partial.finalPrice);
    if (partial?.lineTotal) this.lineTotal = new Decimal(partial.lineTotal);
    if (partial?.originalPrice)
      this.originalPrice = new Decimal(partial.originalPrice);
    this.note = partial?.note ?? null;
    this.productName = partial?.productName;
    this.productWidth = partial?.productWidth
      ? new Decimal(partial.productWidth)
      : (partial?.productWidth ?? null);
    this.productHeight = partial?.productHeight
      ? new Decimal(partial.productHeight)
      : (partial?.productHeight ?? null);
  }
}

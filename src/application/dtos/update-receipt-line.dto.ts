import { Decimal } from "decimal.js";

export class UpdateReceiptLineDto {
  productId?: number;
  quantity?: Decimal;
  unitCode?: string;
  unitCost?: Decimal;
  note?: string;
}

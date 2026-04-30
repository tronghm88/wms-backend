import { Decimal } from "decimal.js";

export class AddReceiptLineDto {
  productId: number;
  quantity: Decimal;
  unitCode: string;
  lengthM?: Decimal;
  note?: string;
}

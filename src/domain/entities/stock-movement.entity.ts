import { Decimal } from "decimal.js";
import { StockMovementType } from "../enums";

export class StockMovementEntity {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly txType: StockMovementType,
    public readonly referenceId: number,
    public readonly referenceType: string,
    public readonly deltaQty: Decimal,
    public readonly qtyAfter: Decimal,
    public readonly performedBy: number,
    public readonly note: string | null,
    public readonly createdAt: Date,
  ) {}
}

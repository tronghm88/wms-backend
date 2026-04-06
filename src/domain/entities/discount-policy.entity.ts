import { Decimal } from "decimal.js";
import { DiscountType } from "../enums";

export class DiscountPolicyEntity {
  id: number;
  customerId: number;
  discountType: DiscountType;
  isAppliedAll: boolean;
  productIds: number[];
  discountValue: Decimal;
  isUsed: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<DiscountPolicyEntity>) {
    Object.assign(this, partial);
    if (partial?.discountValue) {
      this.discountValue = new Decimal(partial.discountValue);
    }
  }
}

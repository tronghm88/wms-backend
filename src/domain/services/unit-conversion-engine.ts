import { Decimal } from "decimal.js";

export interface ReceiptLineMetrics {
  areaM2: Decimal | null;
  weightKg: Decimal | null;
}

export class UnitConversionEngine {
  /**
   * Calculates metrics for a receipt line based on physical dimensions and conversion rules.
   *
   * If unitCode is 'roll':
   *   areaM2 = quantity * lengthM * width
   *   weightKg = areaM2 * m2ToKgFactor
   *
   * If unitCode is 'm2':
   *   areaM2 = quantity
   *   weightKg = areaM2 * m2ToKgFactor
   *
   * If unitCode is 'kg':
   *   weightKg = quantity
   *   areaM2 = weightKg / m2ToKgFactor (if factor > 0)
   */
  static calculateReceiptLineMetrics(params: {
    unitCode: string;
    quantity: Decimal;
    lengthM?: Decimal | null;
    width?: Decimal | null;
    m2ToKgFactor?: Decimal | null;
  }): ReceiptLineMetrics {
    const { unitCode, quantity, lengthM, width, m2ToKgFactor } = params;
    const result: ReceiptLineMetrics = {
      areaM2: null,
      weightKg: null,
    };

    if (unitCode === "roll") {
      if (lengthM && width) {
        result.areaM2 = quantity.mul(lengthM).mul(width);
        if (m2ToKgFactor) {
          result.weightKg = result.areaM2.mul(m2ToKgFactor);
        }
      }
    } else if (unitCode === "m2") {
      result.areaM2 = quantity;
      if (m2ToKgFactor) {
        result.weightKg = result.areaM2.mul(m2ToKgFactor);
      }
    } else if (unitCode === "kg") {
      result.weightKg = quantity;
      if (m2ToKgFactor && !m2ToKgFactor.isZero()) {
        result.areaM2 = result.weightKg.div(m2ToKgFactor);
      }
    }

    return result;
  }
}

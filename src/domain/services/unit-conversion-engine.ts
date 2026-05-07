import { Decimal } from "decimal.js";
import { UnitConversionEntity } from "../entities/unit-conversion.entity";

export class UnitConversionEngine {
  /**
   * Converts a quantity from one unit to another using the provided conversion rules.
   * If fromUnit === toUnit, returns the original quantity.
   * Finds a direct conversion from fromUnit to toUnit, or the reverse (toUnit to fromUnit).
   */
  static convertToUnit(
    quantity: Decimal,
    fromUnit: string,
    toUnit: string,
    conversions: UnitConversionEntity[],
  ): Decimal | null {
    if (fromUnit === toUnit) {
      return quantity;
    }

    // Direct conversion: fromUnit -> toUnit
    const direct = conversions.find(
      (c) => c.fromUnit === fromUnit && c.toUnit === toUnit,
    );
    if (direct) {
      return quantity.mul(direct.factor);
    }

    // Reverse conversion: toUnit -> fromUnit
    const reverse = conversions.find(
      (c) => c.fromUnit === toUnit && c.toUnit === fromUnit,
    );
    if (reverse && !reverse.factor.isZero()) {
      return quantity.div(reverse.factor);
    }

    return null; // Cannot convert
  }
}

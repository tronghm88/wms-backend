import { Decimal } from "decimal.js";
import { UnitConversionEngine } from "../../../src/domain/services/unit-conversion-engine";
import { UnitConversionEntity } from "../../../src/domain/entities/unit-conversion.entity";

describe("UnitConversionEngine", () => {
  describe("convertToUnit", () => {
    it("should return the original quantity if fromUnit equals toUnit", () => {
      const quantity = new Decimal(5);
      const result = UnitConversionEngine.convertToUnit(
        quantity,
        "m2",
        "m2",
        [],
      );
      expect(result?.toString()).toBe("5");
    });

    it("should calculate direct conversion correctly", () => {
      const quantity = new Decimal(2); // 2 rolls
      const conversions = [
        new UnitConversionEntity({
          id: 1,
          productId: 1,
          fromUnit: "roll",
          toUnit: "m2",
          factor: new Decimal(50),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      const result = UnitConversionEngine.convertToUnit(
        quantity,
        "roll",
        "m2",
        conversions,
      );
      expect(result?.toString()).toBe("100"); // 2 * 50
    });

    it("should calculate reverse conversion correctly", () => {
      const quantity = new Decimal(100); // 100 m2
      const conversions = [
        new UnitConversionEntity({
          id: 1,
          productId: 1,
          fromUnit: "roll",
          toUnit: "m2",
          factor: new Decimal(50),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      const result = UnitConversionEngine.convertToUnit(
        quantity,
        "m2",
        "roll",
        conversions,
      );
      expect(result?.toString()).toBe("2"); // 100 / 50
    });

    it("should return null if no conversion can be found", () => {
      const quantity = new Decimal(2);
      const conversions = [
        new UnitConversionEntity({
          id: 1,
          productId: 1,
          fromUnit: "roll",
          toUnit: "m2",
          factor: new Decimal(50),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];

      const result = UnitConversionEngine.convertToUnit(
        quantity,
        "roll",
        "kg",
        conversions,
      );
      expect(result).toBeNull();
    });
  });
});

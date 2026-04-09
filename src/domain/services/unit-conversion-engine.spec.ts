import { Decimal } from "decimal.js";
import { UnitConversionEngine } from "./unit-conversion-engine";

describe("UnitConversionEngine", () => {
  describe("calculateReceiptLineMetrics", () => {
    it("should calculate area correctly", () => {
      const quantity = new Decimal(2);
      const lengthM = new Decimal(50);
      const width = new Decimal(1.5);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "roll",
        quantity,
        lengthM,
        width,
      });

      expect(result.areaM2?.toString()).toBe("150");
      expect(result.weightKg).toBeUndefined();
    });

    it("should calculate weight correctly if m2ToKgFactor is provided", () => {
      const quantity = new Decimal(1);
      const lengthM = new Decimal(100);
      const width = new Decimal(2);
      const m2ToKgFactor = new Decimal(0.5);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "roll",
        quantity,
        lengthM,
        width,
        m2ToKgFactor,
      });

      expect(result.areaM2?.toString()).toBe("200");
      expect(result.weightKg?.toString()).toBe("100");
    });

    it("should return empty result if lengthM is missing", () => {
      const quantity = new Decimal(1);
      const width = new Decimal(1.5);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "roll",
        quantity,
        width,
      });

      expect(result.areaM2).toBeUndefined();
      expect(result.weightKg).toBeUndefined();
    });

    it("should return empty result if width is missing", () => {
      const quantity = new Decimal(1);
      const lengthM = new Decimal(50);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "roll",
        quantity,
        lengthM,
      });

      expect(result.areaM2).toBeUndefined();
      expect(result.weightKg).toBeUndefined();
    });

    it("should calculate metrics correctly for m2 unit", () => {
      const quantity = new Decimal(100);
      const m2ToKgFactor = new Decimal(0.5);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "m2",
        quantity,
        m2ToKgFactor,
      });

      expect(result.areaM2?.toString()).toBe("100");
      expect(result.weightKg?.toString()).toBe("50");
    });

    it("should calculate metrics correctly for kg unit", () => {
      const quantity = new Decimal(50);
      const m2ToKgFactor = new Decimal(0.5);

      const result = UnitConversionEngine.calculateReceiptLineMetrics({
        unitCode: "kg",
        quantity,
        m2ToKgFactor,
      });

      expect(result.weightKg?.toString()).toBe("50");
      expect(result.areaM2?.toString()).toBe("100"); // 50 / 0.5
    });
  });
});

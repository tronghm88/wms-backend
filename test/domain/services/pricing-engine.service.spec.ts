import { Decimal } from "decimal.js";
import { PricingEngineService } from "../../../src/domain/services/pricing-engine.service";
import { DiscountPolicyEntity } from "../../../src/domain/entities/discount-policy.entity";
import { DiscountType } from "../../../src/domain/enums";

describe("PricingEngineService", () => {
  const basePrice = new Decimal(100.0);
  const productId = 1;
  const otherProductId = 2;
  const customerId = 1;

  describe("calculateFinalPrice", () => {
    it("should return base price when no policies are provided", () => {
      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [],
      });

      expect(result.finalPrice.toNumber()).toBe(100);
      expect(result.appliedDiscountType).toBe(DiscountType.NONE);
    });

    it("should apply product-specific PERCENT discount", () => {
      const policy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: false,
        productIds: [productId],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(10),
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [policy],
      });

      expect(result.finalPrice.toNumber()).toBe(90);
      expect(result.appliedDiscountType).toBe(DiscountType.PERCENT);
      expect(result.appliedDiscountValue.toNumber()).toBe(10);
    });

    it("should apply product-specific AMOUNT discount", () => {
      const policy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: false,
        productIds: [productId],
        discountType: DiscountType.AMOUNT,
        discountValue: new Decimal(15),
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [policy],
      });

      expect(result.finalPrice.toNumber()).toBe(85);
      expect(result.appliedDiscountType).toBe(DiscountType.AMOUNT);
      expect(result.appliedDiscountValue.toNumber()).toBe(15);
    });

    it("should apply general discount when no product-specific discount is found", () => {
      const generalPolicy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: true,
        productIds: [],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(20),
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [generalPolicy],
      });

      expect(result.finalPrice.toNumber()).toBe(80);
      expect(result.appliedDiscountType).toBe(DiscountType.PERCENT);
    });

    it("should prioritize product-specific discount over general discount", () => {
      const specificPolicy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: false,
        productIds: [productId],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(10),
      });

      const generalPolicy = new DiscountPolicyEntity({
        id: 2,
        customerId,
        isAppliedAll: true,
        productIds: [],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(20),
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [specificPolicy, generalPolicy],
      });

      // Should apply 10% instead of 20%
      expect(result.finalPrice.toNumber()).toBe(90);
      expect(result.appliedDiscountType).toBe(DiscountType.PERCENT);
      expect(result.appliedDiscountValue.toNumber()).toBe(10);
    });

    it("should handle general discount correctly for other products", () => {
      const specificPolicy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: false,
        productIds: [productId],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(10),
      });

      const generalPolicy = new DiscountPolicyEntity({
        id: 2,
        customerId,
        isAppliedAll: true,
        productIds: [],
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(20),
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId: otherProductId,
        basePrice,
        policies: [specificPolicy, generalPolicy],
      });

      // Should apply 20% general discount
      expect(result.finalPrice.toNumber()).toBe(80);
      expect(result.appliedDiscountType).toBe(DiscountType.PERCENT);
    });

    it("should not let price go below zero", () => {
      const policy = new DiscountPolicyEntity({
        id: 1,
        customerId,
        isAppliedAll: false,
        productIds: [productId],
        discountType: DiscountType.AMOUNT,
        discountValue: new Decimal(150), // Greater than base price
      });

      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice,
        policies: [policy],
      });

      expect(result.finalPrice.toNumber()).toBe(0);
    });

    it("should round to 3 decimal places as per requirements", () => {
      const result = PricingEngineService.calculateFinalPrice({
        customerId,
        productId,
        basePrice: new Decimal(100),
        policies: [
          new DiscountPolicyEntity({
            id: 1,
            customerId,
            isAppliedAll: true,
            discountType: DiscountType.PERCENT,
            discountValue: new Decimal(33.3333333333), // 1/3 discount
          }),
        ],
      });

      // 100 * (1 - 0.333333333333) = 66.6666666667
      // Rounded to 3 decimal places = 66.667
      expect(result.finalPrice.toString()).toBe("66.667");
    });
  });
});

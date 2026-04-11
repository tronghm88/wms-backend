import { Decimal } from "decimal.js";
import { DiscountPolicyEntity } from "../entities/discount-policy.entity";
import { DiscountType } from "../enums";

export interface PricingResult {
  basePrice: Decimal;
  finalPrice: Decimal;
  appliedDiscountType: DiscountType;
  appliedDiscountValue: Decimal;
}

/**
 * PricingEngineService calculates the final unit price for a product
 * based on the customer's discount hierarchy.
 *
 * Hierarchy:
 * 1. Product-specific discount
 * 2. General discount (Category/General)
 * 3. Base product price
 *
 * This service is "Pure" and has no external dependencies (like repositories).
 */
export class PricingEngineService {
  /**
   * Calculates the final price for a product.
   *
   * @param params - The input parameters for calculation
   * @returns The pricing result including the final price and applied discount details
   */
  static calculateFinalPrice(params: {
    customerId: number;
    productId: number;
    basePrice: Decimal;
    policies: DiscountPolicyEntity[];
  }): PricingResult {
    const { productId, basePrice, policies } = params;

    // 1. Check for product-specific discount
    // We look for a policy that specifically includes this productId
    const productSpecificPolicy = policies.find(
      (p) => !p.isAppliedAll && p.productIds.includes(productId),
    );

    if (productSpecificPolicy) {
      return this.createPricingResult(basePrice, productSpecificPolicy);
    }

    // 2. Check for general discount (Category/General level in the hierarchy)
    // We look for a policy that is marked as applied to all products
    const generalPolicy = policies.find((p) => p.isAppliedAll);

    if (generalPolicy) {
      return this.createPricingResult(basePrice, generalPolicy);
    }

    // 3. No discount found, return base price
    return {
      basePrice,
      finalPrice: basePrice,
      appliedDiscountType: DiscountType.NONE,
      appliedDiscountValue: new Decimal(0),
    };
  }

  /**
   * Applies the discount policy to the base price.
   */
  private static createPricingResult(
    basePrice: Decimal,
    policy: DiscountPolicyEntity,
  ): PricingResult {
    let finalPrice = new Decimal(basePrice);

    if (policy.discountType === DiscountType.PERCENT) {
      // finalPrice = basePrice * (1 - discountValue / 100)
      const multiplier = new Decimal(1).minus(policy.discountValue.div(100));
      finalPrice = basePrice.mul(multiplier);
    } else if (policy.discountType === DiscountType.AMOUNT) {
      // finalPrice = basePrice - discountValue
      finalPrice = basePrice.minus(policy.discountValue);
    }

    // Ensure price is not negative
    if (finalPrice.lt(0)) {
      finalPrice = new Decimal(0);
    }

    // Ensure precision matches database NUMERIC(15,3)
    finalPrice = finalPrice.toDecimalPlaces(3);

    return {
      basePrice,
      finalPrice,
      appliedDiscountType: policy.discountType,
      appliedDiscountValue: policy.discountValue,
    };
  }
}

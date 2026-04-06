export class DiscountPolicyException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DiscountPolicyNotFoundException extends DiscountPolicyException {
  constructor(id: number) {
    super(`Discount policy '${id}' not found`, "DISCOUNT_POLICY_NOT_FOUND");
  }
}

export class DuplicateGeneralDiscountPolicyException extends DiscountPolicyException {
  constructor(customerId: number) {
    super(
      `Customer '${customerId}' already has a general discount policy`,
      "DUPLICATE_GENERAL_DISCOUNT_POLICY",
    );
  }
}

export class ProductAlreadyHasDiscountPolicyException extends DiscountPolicyException {
  constructor(customerId: number, productId: number) {
    super(
      `Product with ID ${productId} already has a discount policy for customer '${customerId}'`,
      "PRODUCT_ALREADY_HAS_DISCOUNT_POLICY",
    );
  }
}

export class InvalidDiscountPolicyConfigurationException extends DiscountPolicyException {
  constructor(message: string) {
    super(message, "INVALID_DISCOUNT_POLICY_CONFIGURATION");
  }
}

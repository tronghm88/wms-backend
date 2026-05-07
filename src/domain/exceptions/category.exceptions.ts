export class CategoryException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CategoryCodeAlreadyExistsException extends CategoryException {
  constructor(code: string) {
    super(
      `Category with code '${code}' already exists`,
      "CATEGORY_CODE_ALREADY_EXISTS",
    );
  }
}

export class CategoryNotFoundException extends CategoryException {
  constructor(id: number | string) {
    super(`Category '${id}' not found`, "CATEGORY_NOT_FOUND");
  }
}

export class CategoryHasProductsException extends CategoryException {
  constructor(id: number) {
    super(
      `Category '${id}' cannot be deleted because it has associated products`,
      "CATEGORY_HAS_PRODUCTS",
    );
  }
}

export class CategoryHasSizesException extends CategoryException {
  constructor(id: number) {
    super(
      `Category '${id}' cannot be deleted because it has associated sizes`,
      "CATEGORY_HAS_SIZES",
    );
  }
}

export class CategoryBaseUnitChangeBlockedException extends CategoryException {
  constructor(id: number) {
    super(
      `Cannot change base unit of category '${id}' because it has confirmed transactions`,
      "CATEGORY_BASE_UNIT_CHANGE_BLOCKED",
    );
  }
}

export class ProductCategoryChangeBlockedException extends CategoryException {
  constructor(productId: number) {
    super(
      `Cannot change category of product '${productId}' because it has confirmed transactions`,
      "PRODUCT_CATEGORY_CHANGE_BLOCKED",
    );
  }
}

export class InvalidCategoryUnitException extends CategoryException {
  constructor(unitCode: string, categoryId: number) {
    super(
      `Unit '${unitCode}' is not configured as an additional unit for category '${categoryId}'`,
      "INVALID_CATEGORY_UNIT",
    );
  }
}

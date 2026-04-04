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

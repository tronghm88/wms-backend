export class ProductException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProductCodeAlreadyExistsException extends ProductException {
  constructor(code: string) {
    super(
      `Product with code '${code}' already exists`,
      "PRODUCT_CODE_ALREADY_EXISTS",
    );
  }
}

export class ProductNotFoundException extends ProductException {
  constructor(id: number | string) {
    super(`Product '${id}' not found`, "PRODUCT_NOT_FOUND");
  }
}

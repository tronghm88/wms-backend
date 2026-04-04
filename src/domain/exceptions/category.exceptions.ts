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

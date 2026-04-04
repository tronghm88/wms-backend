export class CustomerException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CustomerCodeAlreadyExistsException extends CustomerException {
  constructor(code: string) {
    super(
      `Customer with code '${code}' already exists`,
      "CUSTOMER_CODE_ALREADY_EXISTS",
    );
  }
}

export class CustomerNotFoundException extends CustomerException {
  constructor(id: number | string) {
    super(`Customer '${id}' not found`, "CUSTOMER_NOT_FOUND");
  }
}

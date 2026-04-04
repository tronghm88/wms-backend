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

export class CustomerHasIssueTicketsException extends CustomerException {
  constructor(id: number) {
    super(
      `Customer '${id}' cannot be deleted because it has associated issue tickets`,
      "CUSTOMER_CANNOT_DELETE_HAS_TICKETS",
    );
  }
}

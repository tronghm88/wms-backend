export class UnitException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnitCodeAlreadyExistsException extends UnitException {
  constructor(code: string) {
    super(
      `Unit with code '${code}' already exists`,
      "UNIT_CODE_ALREADY_EXISTS",
    );
  }
}

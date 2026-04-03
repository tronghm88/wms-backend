export class AuthException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsException extends AuthException {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS");
  }
}

export class UserInactiveException extends AuthException {
  constructor() {
    super("User account is inactive", "USER_INACTIVE");
  }
}

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

export class InvalidOldPasswordException extends AuthException {
  constructor() {
    super("Invalid old password", "INVALID_OLD_PASSWORD");
  }
}

export class UserNotFoundException extends AuthException {
  constructor() {
    super("User not found", "USER_NOT_FOUND");
  }
}

export class UserInactiveException extends AuthException {
  constructor() {
    super("User account is inactive", "USER_INACTIVE");
  }
}

export class EmailAlreadyExistsException extends AuthException {
  constructor() {
    super("Email already exists", "EMAIL_ALREADY_EXISTS");
  }
}

export class CannotCreateSuperAdminException extends AuthException {
  constructor() {
    super(
      "Cannot create a user with SUPER_ADMIN role",
      "CANNOT_CREATE_SUPER_ADMIN",
    );
  }
}

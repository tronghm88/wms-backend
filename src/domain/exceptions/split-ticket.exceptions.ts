export class SplitTicketException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SplitTicketNotFoundException extends SplitTicketException {
  constructor(id: number) {
    super(`Split ticket with ID ${id} not found`, "SPLIT_TICKET_NOT_FOUND");
  }
}

export class SplitTicketNotDraftException extends SplitTicketException {
  constructor(id: number) {
    super(
      `Split ticket with ID ${id} is not in DRAFT status`,
      "SPLIT_TICKET_NOT_DRAFT",
    );
  }
}

export class SplitTicketNotConfirmedException extends SplitTicketException {
  constructor(id: number) {
    super(
      `Split ticket with ID ${id} is not in CONFIRMED status`,
      "SPLIT_TICKET_NOT_CONFIRMED",
    );
  }
}

export class SplitTicketLineNotFoundException extends SplitTicketException {
  constructor(id: number) {
    super(
      `Split ticket line with ID ${id} not found`,
      "SPLIT_TICKET_LINE_NOT_FOUND",
    );
  }
}

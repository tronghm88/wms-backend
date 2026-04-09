export class ReceiptTicketException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ReceiptTicketNotFoundException extends ReceiptTicketException {
  constructor(id: number) {
    super(`Receipt ticket with ID ${id} not found`, "RECEIPT_TICKET_NOT_FOUND");
  }
}

export class ReceiptTicketNotDraftException extends ReceiptTicketException {
  constructor(id: number) {
    super(
      `Receipt ticket with ID ${id} is not in DRAFT status`,
      "RECEIPT_TICKET_NOT_DRAFT",
    );
  }
}

export class ReceiptTicketLineNotFoundException extends ReceiptTicketException {
  constructor(id: number) {
    super(
      `Receipt ticket line with ID ${id} not found`,
      "RECEIPT_TICKET_LINE_NOT_FOUND",
    );
  }
}

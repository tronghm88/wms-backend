export class IssueTicketException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class IssueTicketNotFoundException extends IssueTicketException {
  constructor(idOrCode: number | string) {
    super(
      `Issue Ticket with ID or Code ${idOrCode} not found.`,
      "ISSUE_TICKET_NOT_FOUND",
    );
  }
}

export class InvalidIssueTicketStatusException extends IssueTicketException {
  constructor(currentStatus: string, expectedStatus: string) {
    super(
      `Issue Ticket must be in ${expectedStatus} status. Current status: ${currentStatus}`,
      "INVALID_ISSUE_TICKET_STATUS",
    );
  }
}

export class IssueTicketNotDraftException extends IssueTicketException {
  constructor(idOrCode: number | string) {
    super(
      `Issue Ticket ${idOrCode} is not in DRAFT status and cannot be modified.`,
      "ISSUE_TICKET_NOT_DRAFT",
    );
  }
}

export class IssueTicketLineNotFoundException extends IssueTicketException {
  constructor(lineId: number) {
    super(
      `Issue Ticket Line with ID ${lineId} not found.`,
      "ISSUE_TICKET_LINE_NOT_FOUND",
    );
  }
}

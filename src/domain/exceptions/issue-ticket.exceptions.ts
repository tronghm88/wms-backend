export class IssueTicketException extends Error {
  public readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

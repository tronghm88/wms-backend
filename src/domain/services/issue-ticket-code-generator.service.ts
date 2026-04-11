import { IIssueTicketRepository } from "../contracts/issue-ticket.repository.interface";

/**
 * IssueTicketCodeGenerator provides a way to generate codes in the format PX-YYYYMM-N.
 * The sequence N must reset to 1 at the start of every calendar month.
 */
export class IssueTicketCodeGenerator {
  /**
   * Generates the next unique code for an Export (Issue) Ticket.
   *
   * @param repository - The Issue Ticket repository
   * @param date - The date of the ticket
   * @returns A string in the format PX-YYYYMM-N
   */
  static async generateNextCode(
    repository: IIssueTicketRepository,
    date: Date,
  ): Promise<string> {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    const lastCode = await repository.getLastCode(yearMonth);
    let nextNumber = 1;

    if (lastCode) {
      // Expected format: PX-YYYYMM-N
      const parts = lastCode.split("-");
      const lastN = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastN)) {
        nextNumber = lastN + 1;
      }
    }

    return `PX-${yearMonth}-${nextNumber}`;
  }
}

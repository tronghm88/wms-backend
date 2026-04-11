import { IIssueTicketRepository } from "../contracts/issue-ticket.repository.interface";
import { IssueTicketCodeGenerator } from "./issue-ticket-code-generator.service";

describe("IssueTicketCodeGenerator", () => {
  let mockRepository: jest.Mocked<IIssueTicketRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      getLastCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IIssueTicketRepository>;
  });

  it("should generate the first code for a month as PX-YYYYMM-1", async () => {
    const date = new Date("2026-04-11T00:00:00Z");
    mockRepository.getLastCode.mockResolvedValue(null);

    const code = await IssueTicketCodeGenerator.generateNextCode(
      mockRepository,
      date,
    );

    expect(code).toBe("PX-202604-1");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const lastCodeMethod = mockRepository.getLastCode;
    expect(lastCodeMethod).toHaveBeenCalledWith("202604");
  });

  it("should increment the sequence from the last code in the month", async () => {
    const date = new Date("2026-04-11T12:00:00Z");
    mockRepository.getLastCode.mockResolvedValue("PX-202604-42");

    const code = await IssueTicketCodeGenerator.generateNextCode(
      mockRepository,
      date,
    );

    expect(code).toBe("PX-202604-43");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const lastCodeMethod = mockRepository.getLastCode;
    expect(lastCodeMethod).toHaveBeenCalledWith("202604");
  });

  it("should reset the sequence at the start of a new month", async () => {
    // Current date is May 2026
    const date = new Date("2026-05-01T00:00:00Z");

    // Repository returns the last code for MAY, which is null (first one)
    // even if there were many codes in April
    mockRepository.getLastCode.mockImplementation((ym) => {
      if (ym === "202605") return Promise.resolve(null);
      return Promise.resolve("PX-202604-99");
    });

    const code = await IssueTicketCodeGenerator.generateNextCode(
      mockRepository,
      date,
    );

    expect(code).toBe("PX-202605-1");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const lastCodeMethod = mockRepository.getLastCode;
    expect(lastCodeMethod).toHaveBeenCalledWith("202605");
  });

  it("should handle large sequence numbers correctly", async () => {
    const date = new Date("2026-04-11T23:59:59Z");
    mockRepository.getLastCode.mockResolvedValue("PX-202604-1023");

    const code = await IssueTicketCodeGenerator.generateNextCode(
      mockRepository,
      date,
    );

    expect(code).toBe("PX-202604-1024");
  });

  it("should fallback to 1 if the last code format is unexpected", async () => {
    const date = new Date("2026-04-11T00:00:00Z");
    mockRepository.getLastCode.mockResolvedValue("INVALID-CODE");

    const code = await IssueTicketCodeGenerator.generateNextCode(
      mockRepository,
      date,
    );

    expect(code).toBe("PX-202604-1");
  });
});

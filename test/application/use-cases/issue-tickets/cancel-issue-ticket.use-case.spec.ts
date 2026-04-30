import { Test, TestingModule } from "@nestjs/testing";
import {
  ISSUE_TICKET_REPOSITORY,
  IIssueTicketRepository,
} from "../../../../src/domain/contracts/issue-ticket.repository.interface";
import { CancelIssueTicketUseCase } from "../../../../src/application/use-cases/issue-tickets/cancel-issue-ticket.use-case";
import { IssueTicketEntity } from "../../../../src/domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../../src/domain/enums";
import { Decimal } from "decimal.js";

describe("CancelIssueTicketUseCase", () => {
  let useCase: CancelIssueTicketUseCase;
  let repository: jest.Mocked<IIssueTicketRepository>;

  const mockUser = {
    id: 1,
    role: "ADMIN",
    permissions: [],
  };

  const mockTicket = new IssueTicketEntity({
    id: 1,
    code: "PX-202604-001",
    date: new Date(),
    customerId: 1,
    status: IssueTicketStatus.CANCELLED,
    createdBy: 1,
    totalAmount: new Decimal(100),
    lines: [],
  });

  const mockResult = {
    ticket: mockTicket,
    warnings: ["Some warning"],
  };

  beforeEach(async () => {
    const mockRepo = {
      cancel: jest.fn().mockResolvedValue(mockResult),
    } as unknown as jest.Mocked<IIssueTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelIssueTicketUseCase,
        {
          provide: ISSUE_TICKET_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CancelIssueTicketUseCase>(CancelIssueTicketUseCase);
    repository = module.get(ISSUE_TICKET_REPOSITORY);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should call repository.cancel and return the ticket and warnings", async () => {
    const result = await useCase.execute(1, mockUser);

    expect(repository["cancel"]).toHaveBeenCalledWith(1, mockUser.id);
    expect(result.ticket).toEqual(mockTicket);
    expect(result.warnings).toEqual(["Some warning"]);
    expect(result.ticket.status).toBe(IssueTicketStatus.CANCELLED);
  });

  it("should bubble up errors from the repository", async () => {
    const error = new Error("Not confirmed");
    repository["cancel"].mockRejectedValue(error);

    await expect(useCase.execute(1, mockUser)).rejects.toThrow("Not confirmed");
  });
});

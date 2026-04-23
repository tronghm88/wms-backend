import { Test, TestingModule } from "@nestjs/testing";
import {
  ISSUE_TICKET_REPOSITORY,
  IIssueTicketRepository,
} from "../../../../src/domain/contracts/issue-ticket.repository.interface";
import { VoidIssueTicketUseCase } from "../../../../src/application/use-cases/issue-tickets/void-issue-ticket.use-case";
import { IssueTicketEntity } from "../../../../src/domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../../src/domain/enums";
import { Decimal } from "decimal.js";

describe("VoidIssueTicketUseCase", () => {
  let useCase: VoidIssueTicketUseCase;
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
      void: jest.fn().mockResolvedValue(mockResult),
    } as unknown as jest.Mocked<IIssueTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoidIssueTicketUseCase,
        {
          provide: ISSUE_TICKET_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<VoidIssueTicketUseCase>(VoidIssueTicketUseCase);
    repository = module.get(ISSUE_TICKET_REPOSITORY);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should call repository.void and return the ticket and warnings", async () => {
    const result = await useCase.execute(1, mockUser);

    expect(repository["void"]).toHaveBeenCalledWith(1, mockUser.id);
    expect(result.ticket).toEqual(mockTicket);
    expect(result.warnings).toEqual(["Some warning"]);
    expect(result.ticket.status).toBe(IssueTicketStatus.CANCELLED);
  });

  it("should bubble up errors from the repository", async () => {
    const error = new Error("Not confirmed");
    repository["void"].mockRejectedValue(error);

    await expect(useCase.execute(1, mockUser)).rejects.toThrow("Not confirmed");
  });
});

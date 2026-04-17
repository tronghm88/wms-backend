/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { CompleteIssueTicketUseCase } from "./complete-issue-ticket.use-case";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";

describe("CompleteIssueTicketUseCase", () => {
  let useCase: CompleteIssueTicketUseCase;
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
    status: IssueTicketStatus.COMPLETED,
    createdBy: 1,
    totalAmount: new Decimal(100),
    lines: [],
  });

  beforeEach(async () => {
    repository = {
      complete: jest.fn().mockResolvedValue(mockTicket),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteIssueTicketUseCase,
        {
          provide: ISSUE_TICKET_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<CompleteIssueTicketUseCase>(
      CompleteIssueTicketUseCase,
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should call repository.complete and return the ticket", async () => {
    const result = await useCase.execute(1, mockUser);

    expect(repository.complete).toHaveBeenCalledWith(1, mockUser.id);
    expect(result).toEqual(mockTicket);
    expect(result.status).toBe(IssueTicketStatus.COMPLETED);
  });

  it("should bubble up errors from the repository", async () => {
    const error = new Error("Not found");
    repository.complete.mockRejectedValue(error);

    await expect(useCase.execute(1, mockUser)).rejects.toThrow("Not found");
  });
});

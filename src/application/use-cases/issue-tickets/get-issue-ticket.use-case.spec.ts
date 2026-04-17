/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetIssueTicketUseCase } from "./get-issue-ticket.use-case";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketNotFoundException } from "../../../domain/exceptions/issue-ticket.exceptions";
import { Decimal } from "decimal.js";
import { IssueTicketStatus } from "../../../domain/enums";

describe("GetIssueTicketUseCase", () => {
  let useCase: GetIssueTicketUseCase;
  let repository: jest.Mocked<IIssueTicketRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetIssueTicketUseCase,
        {
          provide: ISSUE_TICKET_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetIssueTicketUseCase>(GetIssueTicketUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a ticket if found", async () => {
    const mockTicket = new IssueTicketEntity({
      id: 1,
      code: "PX-202604-1",
      date: new Date(),
      customerId: 1,
      status: IssueTicketStatus.DRAFT,
      createdBy: 1,
      totalAmount: new Decimal(100),
      lines: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(mockTicket);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockTicket);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it("should throw IssueTicketNotFoundException if not found", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      IssueTicketNotFoundException,
    );
  });
});

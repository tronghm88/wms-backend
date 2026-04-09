/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ListReceiptTicketsUseCase } from "./list-receipt-tickets.use-case";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";

describe("ListReceiptTicketsUseCase", () => {
  let useCase: ListReceiptTicketsUseCase;
  let repository: jest.Mocked<IReceiptTicketRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByTicketNo: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      getLastTicketNo: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addLine: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListReceiptTicketsUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<ListReceiptTicketsUseCase>(ListReceiptTicketsUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a paginated list of receipt tickets", async () => {
    const mockTickets = [
      new ReceiptTicketEntity({
        id: 1,
        ticketNo: "PN-202604-1",
        status: TransactionStatus.DRAFT,
      }),
      new ReceiptTicketEntity({
        id: 2,
        ticketNo: "PN-202604-2",
        status: TransactionStatus.CONFIRMED,
      }),
    ];

    repository.findMany.mockResolvedValue({
      items: mockTickets,
      total: 2,
    });

    const result = await useCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.data).toEqual(mockTickets);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      lastPage: 1,
    });
    expect(repository.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      status: undefined,
      creatorId: undefined,
      fromDate: undefined,
      toDate: undefined,
      search: undefined,
    });
  });

  it("should apply filters correctly", async () => {
    const mockTickets = [
      new ReceiptTicketEntity({
        id: 1,
        ticketNo: "PN-202604-1",
        status: TransactionStatus.DRAFT,
      }),
    ];

    repository.findMany.mockResolvedValue({
      items: mockTickets,
      total: 1,
    });

    const fromDate = new Date("2026-04-01");
    const toDate = new Date("2026-04-30");

    await useCase.execute({
      page: 2,
      limit: 5,
      status: TransactionStatus.DRAFT,
      creatorId: 1,
      fromDate,
      toDate,
      search: "PN-202604",
    });

    expect(repository.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      status: TransactionStatus.DRAFT,
      creatorId: 1,
      fromDate,
      toDate,
      search: "PN-202604",
    });
  });
});

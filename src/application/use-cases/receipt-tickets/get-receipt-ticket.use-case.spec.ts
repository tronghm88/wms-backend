import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import {
  RECEIPT_TICKET_REPOSITORY,
  IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import { GetReceiptTicketUseCase } from "./get-receipt-ticket.use-case";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";
import { ReceiptTicketNotFoundException } from "../../../domain/exceptions/receipt-ticket.exceptions";

describe("GetReceiptTicketUseCase", () => {
  let useCase: GetReceiptTicketUseCase;
  let repository: jest.Mocked<IReceiptTicketRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findWithLines: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReceiptTicketUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetReceiptTicketUseCase>(GetReceiptTicketUseCase);
    repository = module.get(RECEIPT_TICKET_REPOSITORY);
  });

  it("should return receipt details with calculated totals", async () => {
    const ticketId = 1;
    const mockLines = [
      new ReceiptTicketLineEntity({
        id: 1,
        ticketId,
        productId: 101,
        quantity: new Decimal(2),
        unitCode: "roll",
        areaM2: new Decimal(100),
        weightKg: new Decimal(50),
      }),
      new ReceiptTicketLineEntity({
        id: 2,
        ticketId,
        productId: 102,
        quantity: new Decimal(50),
        unitCode: "m2",
        areaM2: new Decimal(50),
        weightKg: new Decimal(25),
      }),
    ];

    const mockTicket = new ReceiptTicketEntity({
      id: ticketId,
      ticketNo: "PN-202604-1",
      date: new Date(),
      status: TransactionStatus.DRAFT,
      createdBy: 1,
      note: "Test note",
    });

    repository.findWithLines.mockResolvedValue(
      Object.assign(mockTicket, { lines: mockLines }),
    );

    const result = await useCase.execute(ticketId);

    expect(result.id).toBe(ticketId);
    expect(result.lines).toHaveLength(2);
    expect(result.totalM2.toNumber()).toBe(150);
    expect(result.totalKg.toNumber()).toBe(75);
    expect(result.totalRolls.toNumber()).toBe(2);
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    repository.findWithLines.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      ReceiptTicketNotFoundException,
    );
  });
});

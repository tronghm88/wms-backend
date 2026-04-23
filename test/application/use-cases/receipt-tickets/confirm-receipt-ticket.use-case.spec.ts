/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfirmReceiptTicketUseCase } from "../../../../src/application/use-cases/receipt-tickets/confirm-receipt-ticket.use-case";
import { TransactionStatus } from "../../../../src/domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
} from "../../../../src/domain/exceptions/receipt-ticket.exceptions";
import { RECEIPT_TICKET_REPOSITORY } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../../src/domain/entities/receipt-ticket.entity";
import { IReceiptTicketRepository } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";

describe("ConfirmReceiptTicketUseCase", () => {
  let useCase: ConfirmReceiptTicketUseCase;
  let receiptTicketRepository: jest.Mocked<IReceiptTicketRepository>;

  beforeEach(async () => {
    receiptTicketRepository = {
      findById: jest.fn(),
      confirm: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmReceiptTicketUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: receiptTicketRepository,
        },
      ],
    }).compile();

    useCase = module.get<ConfirmReceiptTicketUseCase>(
      ConfirmReceiptTicketUseCase,
    );
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, 1)).rejects.toThrow(
      ReceiptTicketNotFoundException,
    );
  });

  it("should throw ReceiptTicketNotDraftException if ticket is not in DRAFT status", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.CONFIRMED,
      }),
    );

    await expect(useCase.execute(1, 1)).rejects.toThrow(
      ReceiptTicketNotDraftException,
    );
  });

  it("should successfully confirm a receipt ticket", async () => {
    const ticket = new ReceiptTicketEntity({
      id: 1,
      status: TransactionStatus.DRAFT,
    });
    receiptTicketRepository.findById.mockResolvedValue(ticket);
    receiptTicketRepository.confirm.mockResolvedValue({
      ...ticket,
      status: TransactionStatus.CONFIRMED,
    } as ReceiptTicketEntity);

    const result = await useCase.execute(1, 1);

    expect(result.status).toBe(TransactionStatus.CONFIRMED);

    expect(receiptTicketRepository.confirm).toHaveBeenCalledWith(1, 1);
  });
});

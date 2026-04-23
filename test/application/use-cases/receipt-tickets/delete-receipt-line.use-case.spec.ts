/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { DeleteReceiptLineUseCase } from "../../../../src/application/use-cases/receipt-tickets/delete-receipt-line.use-case";
import { TransactionStatus } from "../../../../src/domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
  ReceiptTicketLineNotFoundException,
} from "../../../../src/domain/exceptions/receipt-ticket.exceptions";
import { RECEIPT_TICKET_REPOSITORY } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketLineEntity } from "../../../../src/domain/entities/receipt-ticket-line.entity";
import { ReceiptTicketEntity } from "../../../../src/domain/entities/receipt-ticket.entity";
import { IReceiptTicketRepository } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { Decimal } from "decimal.js";

describe("DeleteReceiptLineUseCase", () => {
  let useCase: DeleteReceiptLineUseCase;
  let receiptTicketRepository: jest.Mocked<IReceiptTicketRepository>;

  beforeEach(async () => {
    receiptTicketRepository = {
      findById: jest.fn(),
      findLineById: jest.fn(),
      deleteLine: jest.fn(),
      deleteLineWithStockAdjustment: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReceiptLineUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: receiptTicketRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteReceiptLineUseCase>(DeleteReceiptLineUseCase);
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, 1, false, 1)).rejects.toThrow(
      ReceiptTicketNotFoundException,
    );
  });

  it("should throw ReceiptTicketNotDraftException if ticket is not in DRAFT status and user is not admin", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.CONFIRMED,
      }),
    );

    await expect(useCase.execute(1, 1, false, 1)).rejects.toThrow(
      ReceiptTicketNotDraftException,
    );
  });

  it("should NOT throw ReceiptTicketNotDraftException if ticket is not in DRAFT status and user IS admin", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.CONFIRMED,
      }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(
      new ReceiptTicketLineEntity({
        id: 1,
        ticketId: 1,
        productId: 1,
        quantity: new Decimal(1),
        unitCode: "roll",
      }),
    );

    await expect(useCase.execute(1, 1, true, 1)).resolves.toBeUndefined();

    expect(
      receiptTicketRepository.deleteLineWithStockAdjustment,
    ).toHaveBeenCalledWith(1, expect.anything(), 1);
  });

  it("should throw ReceiptTicketLineNotFoundException if line does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(null);

    await expect(useCase.execute(1, 1, false, 1)).rejects.toThrow(
      ReceiptTicketLineNotFoundException,
    );
  });

  it("should throw ReceiptTicketLineNotFoundException if line belongs to another ticket", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(
      new ReceiptTicketLineEntity({
        id: 1,
        ticketId: 2,
        productId: 1,
        quantity: new Decimal(1),
        unitCode: "roll",
      }),
    );

    await expect(useCase.execute(1, 1, false, 1)).rejects.toThrow(
      ReceiptTicketLineNotFoundException,
    );
  });

  it("should successfully delete a line item", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(
      new ReceiptTicketLineEntity({
        id: 1,
        ticketId: 1,
        productId: 1,
        quantity: new Decimal(1),
        unitCode: "roll",
      }),
    );

    await useCase.execute(1, 1, false, 1);

    expect(receiptTicketRepository.deleteLine).toHaveBeenCalledWith(1);
  });
});

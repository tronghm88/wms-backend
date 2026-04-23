/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { DeleteReceiptTicketUseCase } from "../../../../src/application/use-cases/receipt-tickets/delete-receipt-ticket.use-case";
import { TransactionStatus } from "../../../../src/domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
} from "../../../../src/domain/exceptions/receipt-ticket.exceptions";
import { RECEIPT_TICKET_REPOSITORY } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { ReceiptTicketEntity } from "../../../../src/domain/entities/receipt-ticket.entity";
import { IReceiptTicketRepository } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";

describe("DeleteReceiptTicketUseCase", () => {
  let useCase: DeleteReceiptTicketUseCase;
  let receiptTicketRepository: jest.Mocked<IReceiptTicketRepository>;

  beforeEach(async () => {
    receiptTicketRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
      deleteWithStockAdjustment: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReceiptTicketUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: receiptTicketRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteReceiptTicketUseCase>(
      DeleteReceiptTicketUseCase,
    );
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, false, 1)).rejects.toThrow(
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

    await expect(useCase.execute(1, false, 1)).rejects.toThrow(
      ReceiptTicketNotDraftException,
    );
  });

  it("should successfully delete a draft receipt ticket", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );

    await useCase.execute(1, false, 1);

    expect(receiptTicketRepository.delete).toHaveBeenCalledWith(1);
  });

  it("should successfully delete a confirmed receipt ticket if user is admin", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.CONFIRMED }),
    );

    await useCase.execute(1, true, 1);

    expect(
      receiptTicketRepository.deleteWithStockAdjustment,
    ).toHaveBeenCalledWith(1, 1);
  });
});

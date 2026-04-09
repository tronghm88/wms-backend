import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import { UpdateReceiptLineUseCase } from "./update-receipt-line.use-case";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
  ReceiptTicketLineNotFoundException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import { RECEIPT_TICKET_REPOSITORY } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { IReceiptTicketRepository } from "../../../domain/contracts/receipt-ticket.repository.interface";
import { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";

describe("UpdateReceiptLineUseCase", () => {
  let useCase: UpdateReceiptLineUseCase;
  let receiptTicketRepository: jest.Mocked<IReceiptTicketRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    receiptTicketRepository = {
      findById: jest.fn(),
      findLineById: jest.fn(),
      updateLine: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;
    productRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;
    unitConversionRepository = {
      findByProductAndUnits: jest.fn(),
    } as unknown as jest.Mocked<IUnitConversionRepository>;
    unitRepository = {
      findByCode: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReceiptLineUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: receiptTicketRepository,
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: unitConversionRepository,
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: unitRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateReceiptLineUseCase>(UpdateReceiptLineUseCase);
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false),
    ).rejects.toThrow(ReceiptTicketNotFoundException);
  });

  it("should throw ReceiptTicketNotDraftException if ticket is not in DRAFT status and user is not admin", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.CONFIRMED,
      }),
    );

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false),
    ).rejects.toThrow(ReceiptTicketNotDraftException);
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
    productRepository.findById.mockResolvedValue(
      new ProductEntity({ id: 1, width: new Decimal(1) }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({ code: "roll" }),
    );
    receiptTicketRepository.updateLine.mockImplementation((id, line) =>
      Promise.resolve(line as ReceiptTicketLineEntity),
    );

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(2) }, true),
    ).resolves.toBeDefined();
  });

  it("should throw ReceiptTicketLineNotFoundException if line does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false),
    ).rejects.toThrow(ReceiptTicketLineNotFoundException);
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

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false),
    ).rejects.toThrow(ReceiptTicketLineNotFoundException);
  });

  it("should successfully update a line item and recalculate metrics", async () => {
    const existingLine = new ReceiptTicketLineEntity({
      id: 1,
      ticketId: 1,
      productId: 1,
      quantity: new Decimal(1),
      unitCode: "roll",
      lengthM: new Decimal(50),
      areaM2: new Decimal(75),
      weightKg: new Decimal(37.5),
    });

    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(existingLine);
    productRepository.findById.mockResolvedValue(
      new ProductEntity({ id: 1, width: new Decimal(1.5) }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({ code: "roll" }),
    );
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(
      new UnitConversionEntity({ factor: new Decimal(0.5) }),
    );
    receiptTicketRepository.updateLine.mockImplementation((id, line) =>
      Promise.resolve(line as ReceiptTicketLineEntity),
    );

    const result = await useCase.execute(
      1,
      1,
      { quantity: new Decimal(2) },
      false,
    );

    expect(result.quantity.toString()).toBe("2");
    expect(result.areaM2?.toString()).toBe("150"); // 2 * 50 * 1.5
    expect(result.weightKg?.toString()).toBe("75"); // 150 * 0.5
  });

  it("should update product and use new product defaults if lengthM not provided", async () => {
    const existingLine = new ReceiptTicketLineEntity({
      id: 1,
      ticketId: 1,
      productId: 1,
      quantity: new Decimal(1),
      unitCode: "roll",
      lengthM: new Decimal(50),
    });

    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(existingLine);
    productRepository.findById.mockResolvedValue(
      new ProductEntity({
        id: 2,
        width: new Decimal(2),
        length: new Decimal(100),
      }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({ code: "roll" }),
    );
    receiptTicketRepository.updateLine.mockImplementation((id, line) =>
      Promise.resolve(line as ReceiptTicketLineEntity),
    );

    const result = await useCase.execute(1, 1, { productId: 2 }, false);

    expect(result.productId).toBe(2);
    expect(result.lengthM?.toString()).toBe("100");
    expect(result.areaM2?.toString()).toBe("200"); // 1 * 100 * 2 (quantity=1 from existing)
  });
});

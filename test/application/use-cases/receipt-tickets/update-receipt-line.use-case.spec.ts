import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import { UpdateReceiptLineUseCase } from "../../../../src/application/use-cases/receipt-tickets/update-receipt-line.use-case";
import { TransactionStatus } from "../../../../src/domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
  ReceiptTicketLineNotFoundException,
} from "../../../../src/domain/exceptions/receipt-ticket.exceptions";
import { PRODUCT_REPOSITORY } from "../../../../src/domain/contracts/product.repository.interface";
import { RECEIPT_TICKET_REPOSITORY } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import { ReceiptTicketLineEntity } from "../../../../src/domain/entities/receipt-ticket-line.entity";
import { ReceiptTicketEntity } from "../../../../src/domain/entities/receipt-ticket.entity";
import { ProductEntity } from "../../../../src/domain/entities/product.entity";
import { UnitConversionEntity } from "../../../../src/domain/entities/unit-conversion.entity";
import { UnitEntity } from "../../../../src/domain/entities/unit.entity";
import { IReceiptTicketRepository } from "../../../../src/domain/contracts/receipt-ticket.repository.interface";
import { IProductRepository } from "../../../../src/domain/contracts/product.repository.interface";
import { IUnitConversionRepository } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { IUnitRepository } from "../../../../src/domain/contracts/unit.repository.interface";

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
      updateLineWithStockAdjustment: jest.fn(),
    } as unknown as jest.Mocked<IReceiptTicketRepository>;
    productRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;
    unitConversionRepository = {
      findByProductAndUnits: jest.fn(),
      findByProductId: jest.fn().mockResolvedValue([]),
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
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false, 1),
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
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false, 1),
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
    unitConversionRepository.findByProductId.mockResolvedValue([
      new UnitConversionEntity({ toUnit: "roll", factor: new Decimal(0.5) }),
    ]);
    receiptTicketRepository.updateLineWithStockAdjustment.mockImplementation(
      (id, line) => Promise.resolve(line),
    );

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(2) }, true, 1),
    ).resolves.toBeDefined();
  });

  it("should throw ReceiptTicketLineNotFoundException if line does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({ id: 1, status: TransactionStatus.DRAFT }),
    );
    receiptTicketRepository.findLineById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false, 1),
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
      useCase.execute(1, 1, { quantity: new Decimal(1) }, false, 1),
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
    unitConversionRepository.findByProductId.mockResolvedValue([
      new UnitConversionEntity({ toUnit: "roll", factor: new Decimal(0.5) }),
    ]);
    receiptTicketRepository.updateLine.mockImplementation((id, line) =>
      Promise.resolve(line as ReceiptTicketLineEntity),
    );

    const result = await useCase.execute(
      1,
      1,
      { quantity: new Decimal(2) },
      false,
      1,
    );

    expect(result.quantity.toString()).toBe("2");
    expect(result.areaM2).toBeNull();
    expect(result.weightKg).toBeNull();
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
    unitConversionRepository.findByProductId.mockResolvedValue([
      new UnitConversionEntity({ toUnit: "roll", factor: new Decimal(0.5) }),
    ]);
    receiptTicketRepository.updateLine.mockImplementation((id, line) =>
      Promise.resolve(line as ReceiptTicketLineEntity),
    );

    const result = await useCase.execute(1, 1, { productId: 2 }, false, 1);

    expect(result.productId).toBe(2);
    expect(result.lengthM?.toString()).toBe("100");
    expect(result.areaM2).toBeNull();
  });
});

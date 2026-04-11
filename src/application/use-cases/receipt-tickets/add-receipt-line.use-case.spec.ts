import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import { AddReceiptLineUseCase } from "./add-receipt-line.use-case";
import { TransactionStatus } from "../../../domain/enums";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
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

describe("AddReceiptLineUseCase", () => {
  let useCase: AddReceiptLineUseCase;
  let receiptTicketRepository: jest.Mocked<IReceiptTicketRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    receiptTicketRepository = {
      findById: jest.fn(),
      addLine: jest.fn(),
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
        AddReceiptLineUseCase,
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

    useCase = module.get<AddReceiptLineUseCase>(AddReceiptLineUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw ReceiptTicketNotFoundException if ticket does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        1,
        {
          productId: 1,
          quantity: new Decimal(1),
          unitCode: "roll",
        },
        false,
        1,
      ),
    ).rejects.toThrow(ReceiptTicketNotFoundException);
  });

  it("should throw ReceiptTicketNotDraftException if ticket is not in DRAFT status", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.CONFIRMED,
      }),
    );

    await expect(
      useCase.execute(
        1,
        {
          productId: 1,
          quantity: new Decimal(1),
          unitCode: "roll",
        },
        false,
        1,
      ),
    ).rejects.toThrow(ReceiptTicketNotDraftException);
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.DRAFT,
      }),
    );
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        1,
        {
          productId: 1,
          quantity: new Decimal(1),
          unitCode: "roll",
        },
        false,
        1,
      ),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it("should throw UnitNotFoundException if unit does not exist", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.DRAFT,
      }),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity({
        id: 1,
        width: new Decimal(1.5),
      }),
    );
    unitRepository.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute(
        1,
        {
          productId: 1,
          quantity: new Decimal(1),
          unitCode: "roll",
        },
        false,
        1,
      ),
    ).rejects.toThrow(UnitNotFoundException);
  });

  it("should successfully add a line item and calculate metrics", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.DRAFT,
      }),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity({
        id: 1,
        width: new Decimal(1.5),
      }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({
        code: "roll",
      }),
    );
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(
      new UnitConversionEntity({
        factor: new Decimal(0.5), // m2 to kg
      }),
    );
    receiptTicketRepository.addLine.mockImplementation((line) =>
      Promise.resolve(
        new ReceiptTicketLineEntity({
          ...line,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const result = await useCase.execute(
      1,
      {
        productId: 1,
        quantity: new Decimal(2),
        unitCode: "roll",
        lengthM: new Decimal(50),
      },
      false,
      1,
    );

    expect(result).toBeInstanceOf(ReceiptTicketLineEntity);
    expect(result.areaM2?.toString()).toBe("150"); // 2 * 50 * 1.5
    expect(result.weightKg?.toString()).toBe("75"); // 150 * 0.5
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(receiptTicketRepository.addLine).toHaveBeenCalled();
  });

  it("should successfully add a line item with m2 unit and calculate metrics without lengthM", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.DRAFT,
      }),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity({
        id: 1,
        width: new Decimal(1.5),
      }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({
        code: "m2",
      }),
    );
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(
      new UnitConversionEntity({
        factor: new Decimal(0.5), // m2 to kg
      }),
    );
    receiptTicketRepository.addLine.mockImplementation((line) =>
      Promise.resolve(
        new ReceiptTicketLineEntity({
          ...line,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const result = await useCase.execute(
      1,
      {
        productId: 1,
        quantity: new Decimal(100),
        unitCode: "m2",
      },
      false,
      1,
    );

    expect(result.areaM2?.toString()).toBe("100");
    expect(result.weightKg?.toString()).toBe("50");
  });

  it("should fallback to product.length if lengthM is not provided for roll unit", async () => {
    receiptTicketRepository.findById.mockResolvedValue(
      new ReceiptTicketEntity({
        id: 1,
        status: TransactionStatus.DRAFT,
      }),
    );
    productRepository.findById.mockResolvedValue(
      new ProductEntity({
        id: 1,
        width: new Decimal(1.5),
        length: new Decimal(50),
      }),
    );
    unitRepository.findByCode.mockResolvedValue(
      new UnitEntity({
        code: "roll",
      }),
    );
    unitConversionRepository.findByProductAndUnits.mockResolvedValue(
      new UnitConversionEntity({
        factor: new Decimal(0.5), // m2 to kg
      }),
    );
    receiptTicketRepository.addLine.mockImplementation((line) =>
      Promise.resolve(
        new ReceiptTicketLineEntity({
          ...line,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    const result = await useCase.execute(
      1,
      {
        productId: 1,
        quantity: new Decimal(2),
        unitCode: "roll",
      },
      false,
      1,
    );

    expect(result.areaM2?.toString()).toBe("150"); // 2 * 50 * 1.5
    expect(result.weightKg?.toString()).toBe("75"); // 150 * 0.5
  });
});

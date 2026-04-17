/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateReceiptTicketUseCase } from "./create-receipt-ticket.use-case";
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";

import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import {
  UNIT_CONVERSION_REPOSITORY,
  type IUnitConversionRepository,
} from "../../../domain/contracts/unit-conversion.repository.interface";
import {
  UNIT_REPOSITORY,
  type IUnitRepository,
} from "../../../domain/contracts/unit.repository.interface";

describe("CreateReceiptTicketUseCase", () => {
  let useCase: CreateReceiptTicketUseCase;
  let repository: jest.Mocked<IReceiptTicketRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByTicketNo: jest.fn(),
      findAll: jest.fn(),
      getLastTicketNo: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        CreateReceiptTicketUseCase,
        {
          provide: RECEIPT_TICKET_REPOSITORY,
          useValue: repository,
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

    useCase = module.get<CreateReceiptTicketUseCase>(
      CreateReceiptTicketUseCase,
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a receipt ticket successfully with correct ID format", async () => {
    const dto = { note: "Test note", lines: [] };
    const userId = 1;
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    repository.getLastTicketNo.mockResolvedValue(`PN-${yearMonth}-5`);
    repository.create.mockImplementation((ticket) => {
      return Promise.resolve(
        new ReceiptTicketEntity({
          ...ticket,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    });

    const result = await useCase.execute(dto, userId);

    expect(result.ticketNo).toBe(`PN-${yearMonth}-6`);
    expect(result.status).toBe(TransactionStatus.DRAFT);
    expect(result.createdBy).toBe(userId);
    expect(result.note).toBe(dto.note);
    expect(repository.getLastTicketNo).toHaveBeenCalledWith(yearMonth);
    expect(repository.create).toHaveBeenCalled();
  });

  it("should start with sequence 1 if no previous ticket exists for the month", async () => {
    const dto = { note: "Test note", lines: [] };
    const userId = 1;
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    repository.getLastTicketNo.mockResolvedValue(null);
    repository.create.mockImplementation((ticket) => {
      return Promise.resolve(
        new ReceiptTicketEntity({
          ...ticket,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    });

    const result = await useCase.execute(dto, userId);

    expect(result.ticketNo).toBe(`PN-${yearMonth}-1`);
    expect(repository.create).toHaveBeenCalled();
  });

  it("should retry if unique constraint violation occurs", async () => {
    const dto = { note: "Test note", lines: [] };
    const userId = 1;
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    repository.getLastTicketNo
      .mockResolvedValueOnce(`PN-${yearMonth}-5`)
      .mockResolvedValueOnce(`PN-${yearMonth}-6`);

    repository.create
      .mockRejectedValueOnce({ code: "P2002" }) // Simulate unique constraint violation
      .mockImplementationOnce((ticket) => {
        return Promise.resolve(
          new ReceiptTicketEntity({
            ...ticket,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      });

    const result = await useCase.execute(dto, userId);

    expect(result.ticketNo).toBe(`PN-${yearMonth}-7`);
    expect(repository.create).toHaveBeenCalledTimes(2);
  });

  it("should throw error after max retries", async () => {
    const dto = { note: "Test note", lines: [] };
    const userId = 1;

    repository.getLastTicketNo.mockResolvedValue("PN-202604-5");
    repository.create.mockRejectedValue({ code: "P2002" });

    await expect(useCase.execute(dto, userId)).rejects.toThrow(
      "Failed to generate a unique ticket number after max retries.",
    );
    expect(repository.create).toHaveBeenCalledTimes(5);
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import {
  CreateSplitTicketUseCase,
  CreateSplitTicketRequest,
} from "../../../../src/application/use-cases/split-tickets/create-split-ticket.use-case";
import { SplitTicketEntity } from "../../../../src/domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../../src/domain/enums";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../../src/domain/contracts/split-ticket.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../../src/domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../../src/domain/entities/product.entity";
import { NotFoundException } from "@nestjs/common";

describe("CreateSplitTicketUseCase", () => {
  let useCase: CreateSplitTicketUseCase;
  let splitRepository: jest.Mocked<ISplitTicketRepository>;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    splitRepository = {
      findById: jest.fn(),
      findByTicketNo: jest.fn(),
      findAll: jest.fn(),
      getLastTicketNo: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ISplitTicketRepository>;

    productRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSplitTicketUseCase,
        {
          provide: SPLIT_TICKET_REPOSITORY,
          useValue: splitRepository,
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateSplitTicketUseCase>(CreateSplitTicketUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a split ticket successfully", async () => {
    const request: CreateSplitTicketRequest = {
      sourceProductId: 1,
      warehouseId: 1,
      sourceQty: 100,
      sourceUnitCode: "m2",
      note: "Test split",
    };
    const userId = 1;
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    productRepository.findById.mockResolvedValue({ id: 1 } as ProductEntity);
    splitRepository.getLastTicketNo.mockResolvedValue(`ST-${yearMonth}-5`);
    splitRepository.create.mockImplementation((ticket) => {
      return Promise.resolve(
        new SplitTicketEntity({
          ...ticket,
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    });

    const result = await useCase.execute(request, userId);

    expect(result.ticketNo).toBe(`ST-${yearMonth}-6`);
    expect(result.status).toBe(TransactionStatus.DRAFT);
    expect(result.createdBy).toBe(userId);
    expect(result.sourceProductId).toBe(request.sourceProductId);
    expect(result.sourceQty.toNumber()).toBe(request.sourceQty);
    expect(splitRepository.getLastTicketNo).toHaveBeenCalledWith(yearMonth);
    expect(splitRepository.create).toHaveBeenCalled();
  });

  it("should throw NotFoundException if product does not exist", async () => {
    const request: CreateSplitTicketRequest = {
      sourceProductId: 999,
      warehouseId: 1,
      sourceQty: 100,
      sourceUnitCode: "m2",
    };
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(request, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should retry if unique constraint violation occurs", async () => {
    const request: CreateSplitTicketRequest = {
      sourceProductId: 1,
      warehouseId: 1,
      sourceQty: 100,
      sourceUnitCode: "m2",
    };
    const userId = 1;
    const now = new Date();
    const yearMonth = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    productRepository.findById.mockResolvedValue({ id: 1 } as ProductEntity);
    splitRepository.getLastTicketNo
      .mockResolvedValueOnce(`ST-${yearMonth}-5`)
      .mockResolvedValueOnce(`ST-${yearMonth}-6`);

    splitRepository.create
      .mockRejectedValueOnce({ code: "P2002" })
      .mockImplementationOnce((ticket) => {
        return Promise.resolve(
          new SplitTicketEntity({
            ...ticket,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      });

    const result = await useCase.execute(request, userId);

    expect(result.ticketNo).toBe(`ST-${yearMonth}-7`);
    expect(splitRepository.create).toHaveBeenCalledTimes(2);
  });
});

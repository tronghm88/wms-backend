/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateProductUseCase } from "./create-product.use-case";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { ProductCodeAlreadyExistsException } from "../../../domain/exceptions/product.exceptions";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";

describe("CreateProductUseCase", () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    productRepository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasHistory: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    categoryRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasProducts: jest.fn(),
      hasSizes: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    unitRepository = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
        {
          provide: CATEGORY_REPOSITORY,
          useValue: categoryRepository,
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: unitRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a product successfully", async () => {
    const request = {
      code: "PROD001",
      name: "Product 1",
      categoryId: 1,
      baseUnit: "m2",
      basePrice: "100.500",
      length: "2.000",
      width: "1.000",
      height: "0.500",
    };

    productRepository.findByCode.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(
      new CategoryEntity({ id: 1, name: "Category 1" }),
    );
    unitRepository.findByCode.mockResolvedValue(new UnitEntity({ code: "m2" }));
    productRepository.create.mockResolvedValue(
      new ProductEntity({
        id: 1,
        ...request,
        categoryName: "Category 1",
        basePrice: new Decimal(request.basePrice),
        length: new Decimal(request.length),
        width: new Decimal(request.width),
        height: new Decimal(request.height),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(request);

    expect(result.code).toBe(request.code);
    expect(result.basePrice).toBe(request.basePrice);
    expect(productRepository.create).toHaveBeenCalled();
  });

  it("should throw ProductCodeAlreadyExistsException if code exists", async () => {
    const request = {
      code: "PROD001",
      name: "Product 1",
      categoryId: 1,
      baseUnit: "m2",
      basePrice: "100.500",
    };
    productRepository.findByCode.mockResolvedValue(
      new ProductEntity({ code: request.code }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      ProductCodeAlreadyExistsException,
    );
  });

  it("should throw CategoryNotFoundException if category does not exist", async () => {
    const request = {
      code: "PROD001",
      name: "Product 1",
      categoryId: 999,
      baseUnit: "m2",
      basePrice: "100.500",
    };
    productRepository.findByCode.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it("should throw UnitNotFoundException if unit does not exist", async () => {
    const request = {
      code: "PROD001",
      name: "Product 1",
      categoryId: 1,
      baseUnit: "nonexistent",
      basePrice: "100.500",
    };
    productRepository.findByCode.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(
      new CategoryEntity({ id: 1 }),
    );
    unitRepository.findByCode.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow(
      UnitNotFoundException,
    );
  });
});

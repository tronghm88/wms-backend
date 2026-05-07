/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetProductUseCase } from "../../../../src/application/use-cases/products/get-product.use-case";
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from "../../../../src/domain/contracts/product.repository.interface";
import { INVENTORY_REPOSITORY } from "../../../../src/domain/contracts/inventory.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import { ProductEntity } from "../../../../src/domain/entities/product.entity";
import { ProductNotFoundException } from "../../../../src/domain/exceptions/product.exceptions";
import { Decimal } from "decimal.js";

describe("GetProductUseCase", () => {
  let useCase: GetProductUseCase;
  let repository: jest.Mocked<IProductRepository>;

  const mockProduct = new ProductEntity({
    id: 1,
    code: "PROD-001",
    name: "Test Product",
    categoryId: 1,
    categoryName: "Test Category",
    baseUnit: "kg",
    basePrice: new Decimal("100.000"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasHistory: jest.fn(),
      findLineage: jest.fn(),
      getStats: jest.fn(),
      updateBaseUnitByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
        },
        {
          provide: INVENTORY_REPOSITORY,
          useValue: { findByProductId: jest.fn() },
        },
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: { findByProductId: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: {
            findByCode: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProductUseCase>(GetProductUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return product details when product exists", async () => {
    repository.findById.mockResolvedValue(mockProduct);

    const result = await useCase.execute(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: mockProduct.id,
      code: mockProduct.code,
      name: mockProduct.name,
      categoryId: mockProduct.categoryId,
      categoryName: mockProduct.categoryName,
      baseUnit: mockProduct.baseUnit,
      baseUnitLabel: "kg",
      basePrice: "100.000",
      costPrice: undefined,
      description: undefined,
      length: null,
      width: null,
      height: null,
      parentProductId: undefined,
      reorderThreshold: "0.000",
      specText: undefined,
      stock: "0.000",
      stockConversions: [],
      unitConversions: [],
      createdAt: mockProduct.createdAt,
      updatedAt: mockProduct.updatedAt,
    });
  });

  it("should return product details with parentProductId when exists", async () => {
    const childProduct = new ProductEntity({
      ...mockProduct,
      id: 2,
      parentProductId: 1,
    });
    repository.findById.mockResolvedValue(childProduct);

    const result = await useCase.execute(2);

    expect(result.parentProductId).toBe(1);
  });

  it("should throw ProductNotFoundException when product does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      ProductNotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(999);
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ListProductsUseCase } from "../../../../src/application/use-cases/products/list-products.use-case";
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from "../../../../src/domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../../src/domain/entities/product.entity";
import { Decimal } from "decimal.js";

describe("ListProductsUseCase", () => {
  let useCase: ListProductsUseCase;
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
      findAll: jest.fn().mockResolvedValue([mockProduct]),
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasHistory: jest.fn(),
      findLineage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductsUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<ListProductsUseCase>(ListProductsUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a list of products with formatted decimals", async () => {
    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: mockProduct.id,
      code: mockProduct.code,
      name: mockProduct.name,
      categoryId: mockProduct.categoryId,
      categoryName: mockProduct.categoryName,
      baseUnit: mockProduct.baseUnit,
      basePrice: "100.000",
      length: undefined,
      width: undefined,
      height: undefined,
      parentProductId: undefined,
      createdAt: mockProduct.createdAt,
      updatedAt: mockProduct.updatedAt,
    });
  });
});

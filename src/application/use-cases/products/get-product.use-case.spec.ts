/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetProductUseCase } from "./get-product.use-case";
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
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
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
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
      basePrice: "100.000",
      length: undefined,
      width: undefined,
      height: undefined,
      createdAt: mockProduct.createdAt,
      updatedAt: mockProduct.updatedAt,
    });
  });

  it("should throw ProductNotFoundException when product does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      ProductNotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(999);
  });
});

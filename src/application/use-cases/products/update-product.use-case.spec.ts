/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateProductUseCase } from "./update-product.use-case";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import {
  ProductCodeAlreadyExistsException,
  ProductNotFoundException,
} from "../../../domain/exceptions/product.exceptions";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";

describe("UpdateProductUseCase", () => {
  let useCase: UpdateProductUseCase;
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
        UpdateProductUseCase,
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

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
  });

  it("should update a product successfully", async () => {
    const existingProduct = new ProductEntity({
      id: 1,
      code: "PROD001",
      name: "Old Name",
      categoryId: 1,
      categoryName: "Category 1",
      baseUnit: "m2",
      basePrice: new Decimal("100.000"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = {
      id: 1,
      name: "New Name",
      basePrice: "150.500",
    };

    productRepository.findById.mockResolvedValue(existingProduct);
    productRepository.update.mockImplementation((id, product) => {
      return Promise.resolve(
        new ProductEntity({
          ...existingProduct,
          ...product,
          updatedAt: new Date(),
        }),
      );
    });

    const result = await useCase.execute(request);

    expect(result.name).toBe(request.name);
    expect(result.basePrice).toBe(request.basePrice);
    expect(productRepository.update).toHaveBeenCalled();
  });

  it("should update category successfully", async () => {
    const existingProduct = new ProductEntity({
      id: 1,
      code: "PROD001",
      categoryId: 1,
      categoryName: "Old Category",
      basePrice: new Decimal("100.000"),
      baseUnit: "kg",
    });

    const request = {
      id: 1,
      categoryId: 2,
    };

    productRepository.findById.mockResolvedValue(existingProduct);
    categoryRepository.findById.mockResolvedValue(
      new CategoryEntity({ id: 2, name: "New Category" }),
    );
    productRepository.update.mockImplementation((id, product) => {
      return Promise.resolve(
        new ProductEntity({
          ...existingProduct,
          ...product,
          updatedAt: new Date(),
        }),
      );
    });

    const result = await useCase.execute(request);

    expect(result.categoryId).toBe(2);
    expect(categoryRepository.findById).toHaveBeenCalledWith(2);
    expect(productRepository.update).toHaveBeenCalled();
    // We can't easily check the updated product's categoryName here
    // because result is UpdateProductResponse which doesn't have categoryName yet
    // but the entity passed to update should have it.
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999 })).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it("should throw ProductCodeAlreadyExistsException if new code exists for another product", async () => {
    const existingProduct = new ProductEntity({
      id: 1,
      code: "PROD001",
      name: "Product 1",
      categoryName: "Category 1",
    });

    productRepository.findById.mockResolvedValue(existingProduct);
    productRepository.findByCode.mockResolvedValue(
      new ProductEntity({ id: 2, code: "PROD002", categoryName: "Category 1" }),
    );

    await expect(useCase.execute({ id: 1, code: "PROD002" })).rejects.toThrow(
      ProductCodeAlreadyExistsException,
    );
  });

  it("should throw CategoryNotFoundException if new category does not exist", async () => {
    const existingProduct = new ProductEntity({
      id: 1,
      code: "PROD001",
      categoryId: 1,
      categoryName: "Category 1",
    });

    productRepository.findById.mockResolvedValue(existingProduct);
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 1, categoryId: 999 })).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it("should throw UnitNotFoundException if new unit does not exist", async () => {
    const existingProduct = new ProductEntity({
      id: 1,
      code: "PROD001",
      baseUnit: "m2",
      categoryName: "Category 1",
    });

    productRepository.findById.mockResolvedValue(existingProduct);
    unitRepository.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 1, baseUnit: "nonexistent" }),
    ).rejects.toThrow(UnitNotFoundException);
  });
});

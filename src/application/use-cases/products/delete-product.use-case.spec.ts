import { Test, TestingModule } from "@nestjs/testing";
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import { DeleteProductUseCase } from "./delete-product.use-case";
import {
  ProductNotFoundException,
  ProductHasHistoryException,
} from "../../../domain/exceptions/product.exceptions";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { Decimal } from "decimal.js";

describe("DeleteProductUseCase", () => {
  let useCase: DeleteProductUseCase;
  let repository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasHistory: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
  });

  it("should delete a product successfully", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(
      new ProductEntity({
        id,
        code: "P001",
        name: "Product 1",
        categoryId: 1,
        categoryName: "Category 1",
        baseUnit: "m2",
        basePrice: new Decimal(100),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    (repository.hasHistory as jest.Mock).mockResolvedValue(false);

    await useCase.execute(id);

    expect(repository["delete"]).toHaveBeenCalledWith(id);
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(ProductNotFoundException);
    expect(repository["delete"]).not.toHaveBeenCalled();
  });

  it("should throw ProductHasHistoryException if product has history", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(
      new ProductEntity({
        id,
        code: "P001",
        name: "Product 1",
        categoryId: 1,
        categoryName: "Category 1",
        baseUnit: "m2",
        basePrice: new Decimal(100),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    (repository.hasHistory as jest.Mock).mockResolvedValue(true);

    await expect(useCase.execute(id)).rejects.toThrow(
      ProductHasHistoryException,
    );
    expect(repository["delete"]).not.toHaveBeenCalled();
  });
});

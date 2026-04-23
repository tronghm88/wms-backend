import { Test, TestingModule } from "@nestjs/testing";
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from "../../../../src/domain/contracts/category.repository.interface";
import { DeleteCategoryUseCase } from "../../../../src/application/use-cases/categories/delete-category.use-case";
import {
  CategoryNotFoundException,
  CategoryHasProductsException,
  CategoryHasSizesException,
} from "../../../../src/domain/exceptions/category.exceptions";
import { CategoryEntity } from "../../../../src/domain/entities/category.entity";

describe("DeleteCategoryUseCase", () => {
  let useCase: DeleteCategoryUseCase;
  let repository: jest.Mocked<ICategoryRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasProducts: jest.fn(),
      hasSizes: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCategoryUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteCategoryUseCase>(DeleteCategoryUseCase);
  });

  it("should delete category successfully", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(
      new CategoryEntity({ id }),
    );
    (repository.hasProducts as jest.Mock).mockResolvedValue(false);
    (repository.hasSizes as jest.Mock).mockResolvedValue(false);
    (repository.delete as jest.Mock).mockResolvedValue(undefined);

    await useCase.execute(id);

    expect(repository["findById"]).toHaveBeenCalledWith(id);
    expect(repository["hasProducts"]).toHaveBeenCalledWith(id);
    expect(repository["hasSizes"]).toHaveBeenCalledWith(id);
    expect(repository["delete"]).toHaveBeenCalledWith(id);
  });

  it("should throw CategoryNotFoundException if category does not exist", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(
      CategoryNotFoundException,
    );
    expect(repository["delete"]).not.toHaveBeenCalled();
  });

  it("should throw CategoryHasProductsException if category has products", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(
      new CategoryEntity({ id }),
    );
    (repository.hasProducts as jest.Mock).mockResolvedValue(true);

    await expect(useCase.execute(id)).rejects.toThrow(
      CategoryHasProductsException,
    );
    expect(repository["delete"]).not.toHaveBeenCalled();
  });

  it("should throw CategoryHasSizesException if category has sizes", async () => {
    const id = 1;
    (repository.findById as jest.Mock).mockResolvedValue(
      new CategoryEntity({ id }),
    );
    (repository.hasProducts as jest.Mock).mockResolvedValue(false);
    (repository.hasSizes as jest.Mock).mockResolvedValue(true);

    await expect(useCase.execute(id)).rejects.toThrow(
      CategoryHasSizesException,
    );
    expect(repository["delete"]).not.toHaveBeenCalled();
  });
});

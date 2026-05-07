/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetCategoryByIdUseCase } from "../../../../src/application/use-cases/categories/get-category-by-id.use-case";
import { CATEGORY_REPOSITORY } from "../../../../src/domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../../src/domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import { CategoryEntity } from "../../../../src/domain/entities/category.entity";
import { CategoryNotFoundException } from "../../../../src/domain/exceptions/category.exceptions";

describe("GetCategoryByIdUseCase", () => {
  let useCase: GetCategoryByIdUseCase;
  let repository: jest.Mocked<ICategoryRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithUnits: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryByIdUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    useCase = module.get<GetCategoryByIdUseCase>(GetCategoryByIdUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a category when it exists", async () => {
    const categoryId = 1;
    const category = new CategoryEntity({
      id: categoryId,
      code: "CAT1",
      name: "Category 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findByIdWithUnits.mockResolvedValue(category);

    const result = await useCase.execute(categoryId);

    expect(result).toBeDefined();
    expect(result.id).toBe(categoryId);
    expect(result.code).toBe("CAT1");
    expect(result.name).toBe("Category 1");
    expect(repository.findByIdWithUnits).toHaveBeenCalledWith(categoryId);
  });

  it("should throw CategoryNotFoundException when category does not exist", async () => {
    const categoryId = 999;
    repository.findByIdWithUnits.mockResolvedValue(null);

    await expect(useCase.execute(categoryId)).rejects.toThrow(
      CategoryNotFoundException,
    );
    expect(repository.findByIdWithUnits).toHaveBeenCalledWith(categoryId);
  });
});

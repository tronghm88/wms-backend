/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetCategoriesUseCase } from "./get-categories.use-case";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryEntity } from "../../../domain/entities/category.entity";

describe("GetCategoriesUseCase", () => {
  let useCase: GetCategoriesUseCase;
  let repository: jest.Mocked<ICategoryRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return all categories", async () => {
    const categories = [
      new CategoryEntity({
        id: 1,
        code: "CAT1",
        name: "Category 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new CategoryEntity({
        id: 2,
        code: "CAT2",
        name: "Category 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    repository.findAll.mockResolvedValue(categories);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].code).toBe("CAT1");
    expect(result[1].code).toBe("CAT2");
    expect(repository.findAll).toHaveBeenCalled();
  });

  it("should return an empty array when no categories exist", async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(repository.findAll).toHaveBeenCalled();
  });
});

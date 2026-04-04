/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateCategoryUseCase } from "./create-category.use-case";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryCodeAlreadyExistsException } from "../../../domain/exceptions/category.exceptions";
import { CategoryEntity } from "../../../domain/entities/category.entity";

describe("CreateCategoryUseCase", () => {
  let useCase: CreateCategoryUseCase;
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
        CreateCategoryUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a category successfully", async () => {
    const request = { code: "ELECTRONICS", name: "Electronics" };
    repository.findByCode.mockResolvedValue(null);
    repository.create.mockResolvedValue(
      new CategoryEntity({
        id: 1,
        code: request.code,
        name: request.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(request);

    expect(result.code).toBe(request.code);
    expect(result.name).toBe(request.name);
    expect(repository.findByCode).toHaveBeenCalledWith(request.code);
    expect(repository.create).toHaveBeenCalled();
  });

  it("should throw CategoryCodeAlreadyExistsException if code exists", async () => {
    const request = { code: "ELECTRONICS", name: "Electronics" };
    repository.findByCode.mockResolvedValue(
      new CategoryEntity({ code: request.code }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      CategoryCodeAlreadyExistsException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});

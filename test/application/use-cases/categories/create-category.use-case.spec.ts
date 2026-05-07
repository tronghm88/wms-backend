/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateCategoryUseCase } from "../../../../src/application/use-cases/categories/create-category.use-case";
import { CATEGORY_REPOSITORY } from "../../../../src/domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../../src/domain/contracts/category.repository.interface";
import { CategoryCodeAlreadyExistsException } from "../../../../src/domain/exceptions/category.exceptions";
import { CategoryEntity } from "../../../../src/domain/entities/category.entity";

import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../../src/domain/contracts/unit.repository.interface";

describe("CreateCategoryUseCase", () => {
  let useCase: CreateCategoryUseCase;
  let repository: jest.Mocked<ICategoryRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithUnits: jest.fn(),
      hasConfirmedTransactions: jest.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    unitRepository = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: unitRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a category successfully", async () => {
    const request = {
      code: "ELECTRONICS",
      name: "Electronics",
      baseUnit: "kg",
      additionalUnits: ["g"],
    };
    repository.findByCode.mockResolvedValue(null);
    unitRepository.findByCode.mockResolvedValue({
      code: "kg",
      label: "Kilogram",
    });
    repository.create.mockResolvedValue(
      new CategoryEntity({
        id: 1,
        code: request.code,
        name: request.name,
        baseUnit: request.baseUnit,
        additionalUnits: request.additionalUnits,
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
    const request = {
      code: "ELECTRONICS",
      name: "Electronics",
      baseUnit: "kg",
      additionalUnits: [],
    };
    repository.findByCode.mockResolvedValue(
      new CategoryEntity({ code: request.code }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      CategoryCodeAlreadyExistsException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});

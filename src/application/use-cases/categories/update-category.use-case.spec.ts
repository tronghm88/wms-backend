/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateCategoryUseCase } from "./update-category.use-case";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import {
  CategoryCodeAlreadyExistsException,
  CategoryNotFoundException,
} from "../../../domain/exceptions/category.exceptions";
import { CategoryEntity } from "../../../domain/entities/category.entity";

describe("UpdateCategoryUseCase", () => {
  let useCase: UpdateCategoryUseCase;
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
        UpdateCategoryUseCase,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCategoryUseCase>(UpdateCategoryUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should update a category successfully", async () => {
    const existing = new CategoryEntity({
      id: 1,
      code: "OLD_CODE",
      name: "Old Name",
    });
    const request = { id: 1, code: "NEW_CODE", name: "New Name" };

    repository.findById.mockResolvedValue(existing);
    repository.findByCode.mockResolvedValue(null);
    repository.update.mockResolvedValue(
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
    expect(repository.findById).toHaveBeenCalledWith(request.id);
    expect(repository.findByCode).toHaveBeenCalledWith(request.code);
    expect(repository.update).toHaveBeenCalled();
  });

  it("should throw CategoryNotFoundException if category does not exist", async () => {
    const request = { id: 99, code: "NEW_CODE" };
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow(
      CategoryNotFoundException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw CategoryCodeAlreadyExistsException if new code already exists", async () => {
    const existing = new CategoryEntity({
      id: 1,
      code: "OLD_CODE",
      name: "Old Name",
    });
    const request = { id: 1, code: "EXISTS", name: "New Name" };

    repository.findById.mockResolvedValue(existing);
    repository.findByCode.mockResolvedValue(
      new CategoryEntity({ id: 2, code: "EXISTS" }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      CategoryCodeAlreadyExistsException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should not check code uniqueness if code has not changed", async () => {
    const existing = new CategoryEntity({
      id: 1,
      code: "SAME_CODE",
      name: "Old Name",
    });
    const request = { id: 1, code: "SAME_CODE", name: "New Name" };

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(
      new CategoryEntity({
        id: 1,
        code: "SAME_CODE",
        name: request.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await useCase.execute(request);

    expect(repository.findByCode).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalled();
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUnitUseCase } from "../../../../src/application/use-cases/units/create-unit.use-case";
import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../../src/domain/contracts/unit.repository.interface";
import { UnitCodeAlreadyExistsException } from "../../../../src/domain/exceptions/unit.exceptions";
import { UnitEntity } from "../../../../src/domain/entities/unit.entity";

describe("CreateUnitUseCase", () => {
  let useCase: CreateUnitUseCase;
  let repository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUnitUseCase,
        {
          provide: UNIT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUnitUseCase>(CreateUnitUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should create a unit successfully", async () => {
    const request = { code: "kg" };
    repository.findByCode.mockResolvedValue(null);
    repository.create.mockResolvedValue(new UnitEntity({ code: "kg" }));

    const result = await useCase.execute(request);

    expect(result.code).toBe("kg");
    expect(repository.findByCode).toHaveBeenCalledWith("kg");
    expect(repository.create).toHaveBeenCalled();
  });

  it("should throw UnitCodeAlreadyExistsException if code exists", async () => {
    const request = { code: "kg" };
    repository.findByCode.mockResolvedValue(new UnitEntity({ code: "kg" }));

    await expect(useCase.execute(request)).rejects.toThrow(
      UnitCodeAlreadyExistsException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetUnitByCodeUseCase } from "./get-unit-by-code.use-case";
import {
  IUnitRepository,
  UNIT_REPOSITORY,
} from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";

describe("GetUnitByCodeUseCase", () => {
  let useCase: GetUnitByCodeUseCase;
  let repository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUnitByCodeUseCase,
        {
          provide: UNIT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetUnitByCodeUseCase>(GetUnitByCodeUseCase);
  });

  it("should return unit if it exists", async () => {
    const unit = new UnitEntity({ code: "KG" });
    repository.findByCode.mockResolvedValue(unit);

    const result = await useCase.execute("KG");

    expect(result).toEqual(unit);
    expect(repository.findByCode).toHaveBeenCalledWith("KG");
  });

  it("should throw UnitNotFoundException if unit does not exist", async () => {
    repository.findByCode.mockResolvedValue(null);

    await expect(useCase.execute("KG")).rejects.toThrow(UnitNotFoundException);
    expect(repository.findByCode).toHaveBeenCalledWith("KG");
  });
});

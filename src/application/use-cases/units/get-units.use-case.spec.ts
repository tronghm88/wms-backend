/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetUnitsUseCase } from "./get-units.use-case";
import {
  IUnitRepository,
  UNIT_REPOSITORY,
} from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";

describe("GetUnitsUseCase", () => {
  let useCase: GetUnitsUseCase;
  let repository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUnitsUseCase,
        {
          provide: UNIT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetUnitsUseCase>(GetUnitsUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return an array of units", async () => {
    const units = [
      new UnitEntity({ code: "KG" }),
      new UnitEntity({ code: "M" }),
    ];
    repository.findAll.mockResolvedValue(units);

    const result = await useCase.execute();

    expect(result).toEqual(units);
    expect(repository.findAll).toHaveBeenCalled();
  });
});

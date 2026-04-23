/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ListUnitConversionsUseCase } from "../../../../src/application/use-cases/units/list-unit-conversions.use-case";
import { UNIT_CONVERSION_REPOSITORY } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { UnitConversionEntity } from "../../../../src/domain/entities/unit-conversion.entity";
import { Decimal } from "decimal.js";

describe("ListUnitConversionsUseCase", () => {
  let useCase: ListUnitConversionsUseCase;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;

  beforeEach(async () => {
    unitConversionRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByProductAndUnits: jest.fn(),
      findByProductId: jest.fn(),
    } as unknown as jest.Mocked<IUnitConversionRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUnitConversionsUseCase,
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: unitConversionRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListUnitConversionsUseCase>(
      ListUnitConversionsUseCase,
    );
  });

  const conversion1 = new UnitConversionEntity({
    id: 1,
    productId: 1,
    fromUnit: "box",
    toUnit: "pcs",
    factor: new Decimal("24"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const conversion2 = new UnitConversionEntity({
    id: 2,
    productId: 2,
    fromUnit: "kg",
    toUnit: "g",
    factor: new Decimal("1000"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("should return all unit conversions when no productId is provided", async () => {
    unitConversionRepository.findAll.mockResolvedValue([
      conversion1,
      conversion2,
    ]);

    const result = await useCase.execute({});

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[0].factor).toBe("24.000");
    expect(unitConversionRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it("should return filtered unit conversions when productId is provided", async () => {
    unitConversionRepository.findAll.mockResolvedValue([conversion1]);

    const result = await useCase.execute({ productId: 1 });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].productId).toBe(1);
    expect(unitConversionRepository.findAll).toHaveBeenCalledWith(1);
  });
});

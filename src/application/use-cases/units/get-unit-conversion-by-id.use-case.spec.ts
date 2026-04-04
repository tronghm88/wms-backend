/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetUnitConversionByIdUseCase } from "./get-unit-conversion-by-id.use-case";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";
import { Decimal } from "decimal.js";
import { UnitConversionNotFoundException } from "../../../domain/exceptions/unit.exceptions";

describe("GetUnitConversionByIdUseCase", () => {
  let useCase: GetUnitConversionByIdUseCase;
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
        GetUnitConversionByIdUseCase,
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: unitConversionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUnitConversionByIdUseCase>(
      GetUnitConversionByIdUseCase,
    );
  });

  const conversion = new UnitConversionEntity({
    id: 1,
    productId: 1,
    fromUnit: "box",
    toUnit: "pcs",
    factor: new Decimal("24"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("should return the unit conversion when it exists", async () => {
    unitConversionRepository.findById.mockResolvedValue(conversion);

    const result = await useCase.execute({ id: 1 });

    expect(result.id).toBe(1);
    expect(result.productId).toBe(1);
    expect(result.fromUnit).toBe("box");
    expect(result.toUnit).toBe("pcs");
    expect(result.factor).toBe("24.000");
    expect(unitConversionRepository.findById).toHaveBeenCalledWith(1);
  });

  it("should throw UnitConversionNotFoundException when it does not exist", async () => {
    unitConversionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999 })).rejects.toThrow(
      UnitConversionNotFoundException,
    );
    expect(unitConversionRepository.findById).toHaveBeenCalledWith(999);
  });
});

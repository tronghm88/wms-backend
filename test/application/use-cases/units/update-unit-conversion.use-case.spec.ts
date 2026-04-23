/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateUnitConversionUseCase } from "../../../../src/application/use-cases/units/update-unit-conversion.use-case";
import { UNIT_CONVERSION_REPOSITORY } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { UnitConversionNotFoundException } from "../../../../src/domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";
import { UnitConversionEntity } from "../../../../src/domain/entities/unit-conversion.entity";

describe("UpdateUnitConversionUseCase", () => {
  let useCase: UpdateUnitConversionUseCase;
  let unitConversionRepository: jest.Mocked<IUnitConversionRepository>;

  beforeEach(async () => {
    unitConversionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findByProductAndUnits: jest.fn(),
      findByProductId: jest.fn(),
    } as unknown as jest.Mocked<IUnitConversionRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUnitConversionUseCase,
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: unitConversionRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUnitConversionUseCase>(
      UpdateUnitConversionUseCase,
    );
  });

  const request = {
    id: 1,
    factor: "30",
  };

  it("should update a unit conversion factor successfully", async () => {
    const existing = new UnitConversionEntity({
      id: 1,
      productId: 1,
      fromUnit: "box",
      toUnit: "pcs",
      factor: new Decimal("24"),
    });

    unitConversionRepository.findById.mockResolvedValue(existing);
    unitConversionRepository.update.mockResolvedValue(
      new UnitConversionEntity({
        ...existing,
        factor: new Decimal("30"),
      }),
    );

    const result = await useCase.execute(request);

    expect(result.factor.toString()).toBe("30");
    expect(unitConversionRepository.findById).toHaveBeenCalledWith(1);
    expect(unitConversionRepository.update).toHaveBeenCalledWith(1, {
      factor: new Decimal("30"),
    });
  });

  it("should use existing factor if factor is not provided in request", async () => {
    const existing = new UnitConversionEntity({
      id: 1,
      productId: 1,
      fromUnit: "box",
      toUnit: "pcs",
      factor: new Decimal("24"),
    });

    unitConversionRepository.findById.mockResolvedValue(existing);
    unitConversionRepository.update.mockResolvedValue(existing);

    const result = await useCase.execute({ id: 1 });

    expect(result.factor.toString()).toBe("24");
    expect(unitConversionRepository.update).toHaveBeenCalledWith(1, {
      factor: new Decimal("24"),
    });
  });

  it("should throw UnitConversionNotFoundException if conversion does not exist", async () => {
    unitConversionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(request)).rejects.toThrow(
      UnitConversionNotFoundException,
    );
  });
});

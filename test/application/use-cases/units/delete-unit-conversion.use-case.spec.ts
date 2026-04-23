import { Test, TestingModule } from "@nestjs/testing";
import { DeleteUnitConversionUseCase } from "../../../../src/application/use-cases/units/delete-unit-conversion.use-case";
import {
  UNIT_CONVERSION_REPOSITORY,
  IUnitConversionRepository,
} from "../../../../src/domain/contracts/unit-conversion.repository.interface";
import { UnitConversionNotFoundException } from "../../../../src/domain/exceptions/unit.exceptions";
import { UnitConversionEntity } from "../../../../src/domain/entities/unit-conversion.entity";
import { Decimal } from "decimal.js";

/* eslint-disable @typescript-eslint/unbound-method */
describe("DeleteUnitConversionUseCase", () => {
  let useCase: DeleteUnitConversionUseCase;
  let repository: jest.Mocked<IUnitConversionRepository>;

  const mockEntity = new UnitConversionEntity({
    id: 1,
    productId: 1,
    fromUnit: "KG",
    toUnit: "G",
    factor: new Decimal("1000"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUnitConversionUseCase,
        {
          provide: UNIT_CONVERSION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUnitConversionUseCase>(
      DeleteUnitConversionUseCase,
    );
    repository = module.get(UNIT_CONVERSION_REPOSITORY);
  });

  it("should delete a unit conversion when it exists", async () => {
    repository.findById.mockResolvedValue(mockEntity);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 1 });

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("should throw UnitConversionNotFoundException when it does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 999 })).rejects.toThrow(
      UnitConversionNotFoundException,
    );

    expect(repository.findById).toHaveBeenCalledWith(999);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

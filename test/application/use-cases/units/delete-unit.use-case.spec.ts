/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { DeleteUnitUseCase } from "../../../../src/application/use-cases/units/delete-unit.use-case";
import { UNIT_REPOSITORY } from "../../../../src/domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../../src/domain/contracts/unit.repository.interface";
import {
  UnitInUseException,
  UnitNotFoundException,
} from "../../../../src/domain/exceptions/unit.exceptions";
import { UnitEntity } from "../../../../src/domain/entities/unit.entity";

describe("DeleteUnitUseCase", () => {
  let useCase: DeleteUnitUseCase;
  let repository: jest.Mocked<IUnitRepository>;

  beforeEach(async () => {
    repository = {
      findByCode: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUnitRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUnitUseCase,
        {
          provide: UNIT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUnitUseCase>(DeleteUnitUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should delete a unit successfully", async () => {
    const code = "kg";
    repository.findByCode.mockResolvedValue(new UnitEntity({ code }));
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(code);

    expect(repository.findByCode).toHaveBeenCalledWith(code);
    expect(repository.delete).toHaveBeenCalledWith(code);
  });

  it("should throw UnitNotFoundException if unit does not exist", async () => {
    const code = "non-existent";
    repository.findByCode.mockResolvedValue(null);

    await expect(useCase.execute(code)).rejects.toThrow(UnitNotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("should throw UnitInUseException if unit is in use (Prisma P2003 error)", async () => {
    const code = "kg";
    repository.findByCode.mockResolvedValue(new UnitEntity({ code }));
    repository.delete.mockRejectedValue({ code: "P2003" });

    await expect(useCase.execute(code)).rejects.toThrow(UnitInUseException);
    expect(repository.delete).toHaveBeenCalledWith(code);
  });
});

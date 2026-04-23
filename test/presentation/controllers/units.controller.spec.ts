import { Test, TestingModule } from "@nestjs/testing";
import { UnitsController } from "../../../src/presentation/controllers/units.controller";
import { CreateUnitUseCase } from "../../../src/application/use-cases/units/create-unit.use-case";
import { GetUnitsUseCase } from "../../../src/application/use-cases/units/get-units.use-case";
import { GetUnitByCodeUseCase } from "../../../src/application/use-cases/units/get-unit-by-code.use-case";
import { DeleteUnitUseCase } from "../../../src/application/use-cases/units/delete-unit.use-case";
import { RbacGuard } from "../../../src/presentation/guards/rbac.guard";
import { JwtAuthGuard } from "../../../src/presentation/guards/jwt-auth.guard";

describe("UnitsController", () => {
  let controller: UnitsController;
  let deleteUseCase: DeleteUnitUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: CreateUnitUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUnitsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUnitByCodeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUnitUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UnitsController>(UnitsController);
    deleteUseCase = module.get<DeleteUnitUseCase>(DeleteUnitUseCase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("remove", () => {
    it("should call deleteUnitUseCase.execute with correct code", async () => {
      const code = "kg";
      const spy = jest
        .spyOn(deleteUseCase, "execute")
        .mockResolvedValue(undefined);

      await controller.remove(code);

      expect(spy).toHaveBeenCalledWith(code);
    });
  });
});

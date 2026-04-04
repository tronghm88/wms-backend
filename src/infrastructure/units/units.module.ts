import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { UNIT_REPOSITORY } from "../../domain/contracts/unit.repository.interface";
import { UnitRepository } from "../database/repositories/unit.repository";
import { CreateUnitUseCase } from "../../application/use-cases/units/create-unit.use-case";
import { UnitsController } from "../../presentation/controllers/units.controller";

@Module({
  imports: [PrismaModule],
  controllers: [UnitsController],
  providers: [
    {
      provide: UNIT_REPOSITORY,
      useClass: UnitRepository,
    },
    CreateUnitUseCase,
  ],
  exports: [UNIT_REPOSITORY, CreateUnitUseCase],
})
export class UnitsModule {}

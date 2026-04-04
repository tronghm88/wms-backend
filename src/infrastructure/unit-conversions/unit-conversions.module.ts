import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { ProductsModule } from "../products/products.module";
import { UnitsModule } from "../units/units.module";
import { UNIT_CONVERSION_REPOSITORY } from "../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionRepository } from "../database/repositories/unit-conversion.repository";
import { CreateUnitConversionUseCase } from "../../application/use-cases/units/create-unit-conversion.use-case";
import { UpdateUnitConversionUseCase } from "../../application/use-cases/units/update-unit-conversion.use-case";
import { UnitConversionsController } from "../../presentation/controllers/unit-conversions.controller";

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ProductsModule),
    forwardRef(() => UnitsModule),
  ],
  controllers: [UnitConversionsController],
  providers: [
    {
      provide: UNIT_CONVERSION_REPOSITORY,
      useClass: UnitConversionRepository,
    },
    CreateUnitConversionUseCase,
    UpdateUnitConversionUseCase,
  ],
  exports: [
    UNIT_CONVERSION_REPOSITORY,
    CreateUnitConversionUseCase,
    UpdateUnitConversionUseCase,
  ],
})
export class UnitConversionsModule {}

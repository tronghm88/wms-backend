import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { ProductsModule } from "../products/products.module";
import { UnitsModule } from "../units/units.module";
import { UNIT_CONVERSION_REPOSITORY } from "../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionRepository } from "../database/repositories/unit-conversion.repository";
import { CreateUnitConversionUseCase } from "../../application/use-cases/units/create-unit-conversion.use-case";
import { UpdateUnitConversionUseCase } from "../../application/use-cases/units/update-unit-conversion.use-case";
import { ListUnitConversionsUseCase } from "../../application/use-cases/units/list-unit-conversions.use-case";
import { GetUnitConversionByIdUseCase } from "../../application/use-cases/units/get-unit-conversion-by-id.use-case";
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
    ListUnitConversionsUseCase,
    GetUnitConversionByIdUseCase,
  ],
  exports: [
    UNIT_CONVERSION_REPOSITORY,
    CreateUnitConversionUseCase,
    UpdateUnitConversionUseCase,
    ListUnitConversionsUseCase,
    GetUnitConversionByIdUseCase,
  ],
})
export class UnitConversionsModule {}

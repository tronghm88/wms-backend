import { UnitConversionEntity } from "../entities/unit-conversion.entity";

export const UNIT_CONVERSION_REPOSITORY = "UNIT_CONVERSION_REPOSITORY";

export interface IUnitConversionRepository {
  create(conversion: UnitConversionEntity): Promise<UnitConversionEntity>;
  findByProductAndUnits(
    productId: number,
    fromUnit: string,
    toUnit: string,
  ): Promise<UnitConversionEntity | null>;
  findByProductId(productId: number): Promise<UnitConversionEntity[]>;
}

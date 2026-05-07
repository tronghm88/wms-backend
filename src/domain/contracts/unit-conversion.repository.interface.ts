import { UnitConversionEntity } from "../entities/unit-conversion.entity";

export const UNIT_CONVERSION_REPOSITORY = "UNIT_CONVERSION_REPOSITORY";

export interface IUnitConversionRepository {
  create(conversion: UnitConversionEntity): Promise<UnitConversionEntity>;
  update(
    id: number,
    conversion: Partial<UnitConversionEntity>,
  ): Promise<UnitConversionEntity>;
  findById(id: number): Promise<UnitConversionEntity | null>;
  findByProductAndUnits(
    productId: number,
    fromUnit: string,
    toUnit: string,
  ): Promise<UnitConversionEntity | null>;
  findByProductId(productId: number): Promise<UnitConversionEntity[]>;
  findAll(productId?: number): Promise<UnitConversionEntity[]>;
  delete(id: number): Promise<void>;
  deleteByProductId(productId: number): Promise<void>;
  findByProductIdFiltered(
    productId: number,
    allowedToUnits: string[],
  ): Promise<UnitConversionEntity[]>;
}

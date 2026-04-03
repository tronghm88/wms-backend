import { UnitEntity } from '../entities/unit.entity';

export interface IUnitRepository {
  findByCode(code: string): Promise<UnitEntity | null>;
  findAll(): Promise<UnitEntity[]>;
  create(unit: UnitEntity): Promise<UnitEntity>;
  update(code: string, unit: Partial<UnitEntity>): Promise<UnitEntity>;
  delete(code: string): Promise<void>;
}

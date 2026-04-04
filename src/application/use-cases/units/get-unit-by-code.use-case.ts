import { Injectable, Inject } from "@nestjs/common";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";

@Injectable()
export class GetUnitByCodeUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(code: string): Promise<UnitEntity> {
    const unit = await this.unitRepository.findByCode(code);
    if (!unit) {
      throw new UnitNotFoundException(code);
    }
    return unit;
  }
}

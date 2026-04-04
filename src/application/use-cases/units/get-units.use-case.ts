import { Inject, Injectable } from "@nestjs/common";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";

@Injectable()
export class GetUnitsUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(): Promise<UnitEntity[]> {
    return await this.unitRepository.findAll();
  }
}

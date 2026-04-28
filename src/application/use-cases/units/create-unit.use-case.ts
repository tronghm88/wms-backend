import { Injectable, Inject } from "@nestjs/common";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UnitEntity } from "../../../domain/entities/unit.entity";
import { UnitCodeAlreadyExistsException } from "../../../domain/exceptions/unit.exceptions";

export interface CreateUnitRequest {
  code: string;
  label: string;
}

export interface CreateUnitResponse {
  code: string;
  label: string;
}

@Injectable()
export class CreateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(request: CreateUnitRequest): Promise<CreateUnitResponse> {
    const existingUnit = await this.unitRepository.findByCode(request.code);
    if (existingUnit) {
      throw new UnitCodeAlreadyExistsException(request.code);
    }

    const newUnit = new UnitEntity({
      code: request.code,
      label: request.label,
    });

    const createdUnit = await this.unitRepository.create(newUnit);

    return {
      code: createdUnit.code,
      label: createdUnit.label,
    };
  }
}

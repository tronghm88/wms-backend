import { Inject, Injectable } from "@nestjs/common";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";
import { Decimal } from "decimal.js";

export interface UpdateUnitConversionRequest {
  id: number;
  factor?: string;
}

@Injectable()
export class UpdateUnitConversionUseCase {
  constructor(
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
  ) {}

  async execute(
    request: UpdateUnitConversionRequest,
  ): Promise<UnitConversionEntity> {
    const existing = await this.unitConversionRepository.findById(request.id);

    if (!existing) {
      throw new UnitConversionNotFoundException(request.id);
    }

    const updated = await this.unitConversionRepository.update(request.id, {
      factor: request.factor ? new Decimal(request.factor) : existing.factor,
    });

    return updated;
  }
}

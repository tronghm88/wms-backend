import { Inject, Injectable } from "@nestjs/common";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionNotFoundException } from "../../../domain/exceptions/unit.exceptions";

export interface DeleteUnitConversionRequest {
  id: number;
}

@Injectable()
export class DeleteUnitConversionUseCase {
  constructor(
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
  ) {}

  async execute(request: DeleteUnitConversionRequest): Promise<void> {
    const existing = await this.unitConversionRepository.findById(request.id);

    if (!existing) {
      throw new UnitConversionNotFoundException(request.id);
    }

    await this.unitConversionRepository.delete(request.id);
  }
}

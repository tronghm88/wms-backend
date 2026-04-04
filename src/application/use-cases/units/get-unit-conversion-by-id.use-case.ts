import { Injectable, Inject } from "@nestjs/common";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionNotFoundException } from "../../../domain/exceptions/unit.exceptions";

export interface GetUnitConversionByIdRequest {
  id: number;
}

export interface UnitConversionResponse {
  id: number;
  productId: number;
  fromUnit: string;
  toUnit: string;
  factor: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUnitConversionByIdUseCase {
  constructor(
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
  ) {}

  async execute(
    request: GetUnitConversionByIdRequest,
  ): Promise<UnitConversionResponse> {
    const uc = await this.unitConversionRepository.findById(request.id);

    if (!uc) {
      throw new UnitConversionNotFoundException(request.id);
    }

    return {
      id: uc.id,
      productId: uc.productId,
      fromUnit: uc.fromUnit,
      toUnit: uc.toUnit,
      factor: uc.factor.toFixed(3),
      createdAt: uc.createdAt,
      updatedAt: uc.updatedAt,
    };
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";

export interface ListUnitConversionsRequest {
  productId?: number;
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

export type ListUnitConversionsResponse = UnitConversionResponse[];

@Injectable()
export class ListUnitConversionsUseCase {
  constructor(
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
  ) {}

  async execute(
    request: ListUnitConversionsRequest,
  ): Promise<ListUnitConversionsResponse> {
    const conversions = await this.unitConversionRepository.findAll(
      request.productId,
    );

    return conversions.map((uc) => ({
      id: uc.id,
      productId: uc.productId,
      fromUnit: uc.fromUnit,
      toUnit: uc.toUnit,
      factor: uc.factor.toFixed(3),
      createdAt: uc.createdAt,
      updatedAt: uc.updatedAt,
    }));
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { UNIT_CONVERSION_REPOSITORY } from "../../../domain/contracts/unit-conversion.repository.interface";
import type { IUnitConversionRepository } from "../../../domain/contracts/unit-conversion.repository.interface";
import { UnitConversionEntity } from "../../../domain/entities/unit-conversion.entity";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import {
  UnitNotFoundException,
  UnitConversionAlreadyExistsException,
} from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";

export interface CreateUnitConversionRequest {
  productId: number;
  fromUnit: string;
  toUnit: string;
  factor: string;
}

export interface CreateUnitConversionResponse {
  id: number;
  productId: number;
  fromUnit: string;
  toUnit: string;
  factor: string;
}

@Injectable()
export class CreateUnitConversionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: IUnitRepository,
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
  ) {}

  async execute(
    request: CreateUnitConversionRequest,
  ): Promise<CreateUnitConversionResponse> {
    const product = await this.productRepository.findById(request.productId);
    if (!product) {
      throw new ProductNotFoundException(request.productId);
    }

    const fromUnit = await this.unitRepository.findByCode(request.fromUnit);
    if (!fromUnit) {
      throw new UnitNotFoundException(request.fromUnit);
    }

    const toUnit = await this.unitRepository.findByCode(request.toUnit);
    if (!toUnit) {
      throw new UnitNotFoundException(request.toUnit);
    }

    const existingConversion =
      await this.unitConversionRepository.findByProductAndUnits(
        request.productId,
        request.fromUnit,
        request.toUnit,
      );

    if (existingConversion) {
      throw new UnitConversionAlreadyExistsException(
        request.productId,
        request.fromUnit,
        request.toUnit,
      );
    }

    const conversion = new UnitConversionEntity({
      productId: request.productId,
      fromUnit: request.fromUnit,
      toUnit: request.toUnit,
      factor: new Decimal(request.factor),
    });

    const createdConversion =
      await this.unitConversionRepository.create(conversion);

    return {
      id: createdConversion.id,
      productId: createdConversion.productId,
      fromUnit: createdConversion.fromUnit,
      toUnit: createdConversion.toUnit,
      factor: createdConversion.factor.toFixed(3),
    };
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import {
  CategoryCodeAlreadyExistsException,
  CategoryNotFoundException,
  CategoryBaseUnitChangeBlockedException,
} from "../../../domain/exceptions/category.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";

export interface UpdateCategoryRequest {
  id: number;
  code?: string;
  name?: string;
  baseUnit?: string;
  additionalUnits?: string[];
}

export interface UpdateCategoryResponse {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(
    request: UpdateCategoryRequest,
  ): Promise<UpdateCategoryResponse> {
    const category = await this.categoryRepository.findById(request.id);
    if (!category) {
      throw new CategoryNotFoundException(request.id);
    }

    if (request.code && request.code !== category.code) {
      const existing = await this.categoryRepository.findByCode(request.code);
      if (existing) {
        throw new CategoryCodeAlreadyExistsException(request.code);
      }
      category.code = request.code;
    }

    if (request.name) {
      category.name = request.name;
    }

    let baseUnitChanged = false;
    if (request.baseUnit && request.baseUnit !== category.baseUnit) {
      const hasConfirmed =
        await this.categoryRepository.hasConfirmedTransactions(request.id);
      if (hasConfirmed) {
        throw new CategoryBaseUnitChangeBlockedException(request.id);
      }

      const baseUnitExists = await this.unitRepository.findByCode(
        request.baseUnit,
      );
      if (!baseUnitExists) {
        throw new UnitNotFoundException(request.baseUnit);
      }
      category.baseUnit = request.baseUnit;
      baseUnitChanged = true;
    }

    if (request.additionalUnits !== undefined) {
      const additionalUnits = Array.from(new Set(request.additionalUnits));
      const baseUnit = request.baseUnit || category.baseUnit;
      if (baseUnit && additionalUnits.includes(baseUnit)) {
        throw new Error(
          `Base unit '${baseUnit}' cannot be in additional units`,
        );
      }

      for (const unitCode of additionalUnits) {
        const unitExists = await this.unitRepository.findByCode(unitCode);
        if (!unitExists) {
          throw new UnitNotFoundException(unitCode);
        }
      }
      category.additionalUnits = additionalUnits;
    }

    const updated = await this.categoryRepository.update(request.id, {
      code: category.code,
      name: category.name,
      baseUnit: category.baseUnit,
      additionalUnits: category.additionalUnits,
    });

    if (baseUnitChanged) {
      // Bulk update baseUnit for all products
      await this.categoryRepository.updateProductsBaseUnit(
        request.id,
        category.baseUnit,
      );

      // Delete all unit conversions for products in this category
      await this.categoryRepository.deleteProductsUnitConversions(request.id);
    }

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

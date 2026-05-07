import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import { CategoryCodeAlreadyExistsException } from "../../../domain/exceptions/category.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";

export interface CreateCategoryRequest {
  code: string;
  name: string;
  baseUnit: string;
  additionalUnits?: string[];
}

export interface CreateCategoryResponse {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(
    request: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    const existing = await this.categoryRepository.findByCode(request.code);
    if (existing) {
      throw new CategoryCodeAlreadyExistsException(request.code);
    }

    // Validate baseUnit
    const baseUnitExists = await this.unitRepository.findByCode(
      request.baseUnit,
    );
    if (!baseUnitExists) {
      throw new UnitNotFoundException(request.baseUnit);
    }

    // Validate additionalUnits
    const additionalUnits = Array.from(new Set(request.additionalUnits || []));
    if (additionalUnits.includes(request.baseUnit)) {
      throw new Error(
        `Base unit '${request.baseUnit}' cannot be in additional units`,
      );
    }

    for (const unitCode of additionalUnits) {
      const unitExists = await this.unitRepository.findByCode(unitCode);
      if (!unitExists) {
        throw new UnitNotFoundException(unitCode);
      }
    }

    const category = new CategoryEntity({
      code: request.code,
      name: request.name,
      baseUnit: request.baseUnit,
      additionalUnits,
    });

    const created = await this.categoryRepository.create(category);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}

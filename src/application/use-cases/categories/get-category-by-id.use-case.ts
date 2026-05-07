import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";

export interface CategoryUnitItem {
  unitCode: string;
  label: string;
}

export interface GetCategoryByIdResponse {
  id: number;
  code: string;
  name: string;
  baseUnit: string | null;
  baseUnitLabel: string | null;
  additionalUnits: CategoryUnitItem[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(id: number): Promise<GetCategoryByIdResponse> {
    const category = await this.categoryRepository.findByIdWithUnits(id);

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    const allUnits = await this.unitRepository.findAll();
    const unitMap = new Map(allUnits.map((u) => [u.code, u.label]));

    const additionalUnits = (category.additionalUnits || []).map((code) => ({
      unitCode: code,
      label: unitMap.get(code) || code,
    }));

    return {
      id: category.id,
      code: category.code,
      name: category.name,
      baseUnit: category.baseUnit ?? null,
      baseUnitLabel: category.baseUnitLabel || category.baseUnit || null,
      additionalUnits,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}

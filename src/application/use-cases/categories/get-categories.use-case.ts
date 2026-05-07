import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";

export interface GetCategoriesResponse {
  id: number;
  code: string;
  name: string;
  baseUnit: string | null;
  additionalUnits: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<GetCategoriesResponse[]> {
    const categories = await this.categoryRepository.findAll();

    return categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      baseUnit: category.baseUnit ?? null,
      additionalUnits: category.additionalUnits ?? [],
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }
}

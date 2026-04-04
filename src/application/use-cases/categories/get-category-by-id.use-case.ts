import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";

export interface GetCategoryByIdResponse {
  id: number;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: number): Promise<GetCategoryByIdResponse> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return {
      id: category.id,
      code: category.code,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { CategoryEntity } from "../../../domain/entities/category.entity";
import { CategoryCodeAlreadyExistsException } from "../../../domain/exceptions/category.exceptions";

export interface CreateCategoryRequest {
  code: string;
  name: string;
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
  ) {}

  async execute(
    request: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    const existing = await this.categoryRepository.findByCode(request.code);
    if (existing) {
      throw new CategoryCodeAlreadyExistsException(request.code);
    }

    const category = new CategoryEntity({
      code: request.code,
      name: request.name,
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

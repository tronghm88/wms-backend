import { Injectable, Inject } from "@nestjs/common";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import {
  CategoryCodeAlreadyExistsException,
  CategoryNotFoundException,
} from "../../../domain/exceptions/category.exceptions";

export interface UpdateCategoryRequest {
  id: number;
  code?: string;
  name?: string;
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

    const updated = await this.categoryRepository.update(request.id, {
      code: category.code,
      name: category.name,
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

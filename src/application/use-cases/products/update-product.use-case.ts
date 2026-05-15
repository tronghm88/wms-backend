import { Injectable, Inject } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import {
  ProductCodeAlreadyExistsException,
  ProductNotFoundException,
} from "../../../domain/exceptions/product.exceptions";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";
import { Decimal } from "decimal.js";

export interface UpdateProductRequest {
  id: number;
  code?: string;
  name?: string;
  categoryId?: number;
  basePrice?: string;
  costPrice?: string;
  reorderThreshold?: string;
  description?: string;
  specText?: string;
  length?: string;
  width?: string;
  height?: string;
  parentProductId?: number;
}

export interface UpdateProductResponse {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  baseUnit: string;
  basePrice: string;
  costPrice?: string;
  reorderThreshold: string;
  description?: string;
  specText?: string;
  length: string | null;
  width: string | null;
  height: string | null;
  parentProductId?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(request: UpdateProductRequest): Promise<UpdateProductResponse> {
    const product = await this.productRepository.findById(request.id);
    if (!product) {
      throw new ProductNotFoundException(request.id);
    }

    if (request.code && request.code !== product.code) {
      const existingByCode = await this.productRepository.findByCode(
        request.code,
      );
      if (existingByCode) {
        throw new ProductCodeAlreadyExistsException(request.code);
      }
      product.code = request.code;
    }

    if (request.name !== undefined) {
      product.name = request.name;
    }

    if (request.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(
        request.categoryId,
      );
      if (!category) {
        throw new CategoryNotFoundException(request.categoryId);
      }
      product.categoryId = request.categoryId;
      product.categoryName = category.name;

      // Always update baseUnit if category changed
      if (category.baseUnit) {
        product.baseUnit = category.baseUnit;
      }
    }

    if (request.basePrice !== undefined) {
      product.basePrice = new Decimal(request.basePrice);
    }

    if (request.costPrice !== undefined) {
      product.costPrice = request.costPrice
        ? new Decimal(request.costPrice)
        : null;
    }

    if (request.reorderThreshold !== undefined) {
      product.reorderThreshold = new Decimal(request.reorderThreshold);
    }

    if (request.description !== undefined) {
      product.description = request.description;
    }

    if (request.specText !== undefined) {
      product.specText = request.specText;
    }

    if (request.length !== undefined) {
      product.length = request.length ? new Decimal(request.length) : null;
    }

    if (request.width !== undefined) {
      product.width = request.width ? new Decimal(request.width) : null;
    }

    if (request.height !== undefined) {
      product.height = request.height ? new Decimal(request.height) : null;
    }

    if (request.parentProductId !== undefined) {
      product.parentProductId = request.parentProductId;
    }

    const updated = await this.productRepository.update(product.id, product);

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      categoryId: updated.categoryId,
      baseUnit: updated.baseUnit,
      basePrice: updated.basePrice.toFixed(3),
      costPrice: updated.costPrice?.toFixed(3),
      reorderThreshold: updated.reorderThreshold.toFixed(3),
      description: updated.description ?? undefined,
      specText: updated.specText ?? undefined,
      length: updated.length ? updated.length.toFixed(3) : null,
      width: updated.width ? updated.width.toFixed(3) : null,
      height: updated.height ? updated.height.toFixed(3) : null,
      parentProductId: updated.parentProductId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

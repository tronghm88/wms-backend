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
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";

export interface UpdateProductRequest {
  id: number;
  code?: string;
  name?: string;
  categoryId?: number;
  baseUnit?: string;
  basePrice?: string;
  length?: string;
  width?: string;
  height?: string;
}

export interface UpdateProductResponse {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  baseUnit: string;
  basePrice: string;
  length?: string;
  width?: string;
  height?: string;
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
    }

    if (request.baseUnit !== undefined) {
      const unit = await this.unitRepository.findByCode(request.baseUnit);
      if (!unit) {
        throw new UnitNotFoundException(request.baseUnit);
      }
      product.baseUnit = request.baseUnit;
    }

    if (request.basePrice !== undefined) {
      product.basePrice = new Decimal(request.basePrice);
    }

    if (request.length !== undefined) {
      product.length = request.length ? new Decimal(request.length) : undefined;
    }

    if (request.width !== undefined) {
      product.width = request.width ? new Decimal(request.width) : undefined;
    }

    if (request.height !== undefined) {
      product.height = request.height ? new Decimal(request.height) : undefined;
    }

    const updated = await this.productRepository.update(product.id, product);

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      categoryId: updated.categoryId,
      baseUnit: updated.baseUnit,
      basePrice: updated.basePrice.toFixed(3),
      length: updated.length?.toFixed(3),
      width: updated.width?.toFixed(3),
      height: updated.height?.toFixed(3),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

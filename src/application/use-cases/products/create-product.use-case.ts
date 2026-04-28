import { Injectable, Inject } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { CATEGORY_REPOSITORY } from "../../../domain/contracts/category.repository.interface";
import type { ICategoryRepository } from "../../../domain/contracts/category.repository.interface";
import { UNIT_REPOSITORY } from "../../../domain/contracts/unit.repository.interface";
import type { IUnitRepository } from "../../../domain/contracts/unit.repository.interface";
import { ProductEntity } from "../../../domain/entities/product.entity";
import { ProductCodeAlreadyExistsException } from "../../../domain/exceptions/product.exceptions";
import { CategoryNotFoundException } from "../../../domain/exceptions/category.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { Decimal } from "decimal.js";

export interface CreateProductRequest {
  code: string;
  name: string;
  categoryId: number;
  baseUnit: string;
  basePrice: string;
  costPrice?: string;
  reorderThreshold?: string;
  description?: string;
  specText?: string;
  length?: string;
  width?: string;
  height?: string;
  parentProductId?: number;
}

export interface CreateProductResponse {
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
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    const existing = await this.productRepository.findByCode(request.code);
    if (existing) {
      throw new ProductCodeAlreadyExistsException(request.code);
    }

    const category = await this.categoryRepository.findById(request.categoryId);
    if (!category) {
      throw new CategoryNotFoundException(request.categoryId);
    }

    const unit = await this.unitRepository.findByCode(request.baseUnit);
    if (!unit) {
      throw new UnitNotFoundException(request.baseUnit);
    }

    const product = new ProductEntity({
      code: request.code,
      name: request.name,
      categoryId: request.categoryId,
      categoryName: category.name,
      baseUnit: request.baseUnit,
      basePrice: new Decimal(request.basePrice),
      costPrice: request.costPrice ? new Decimal(request.costPrice) : null,
      reorderThreshold: new Decimal(request.reorderThreshold || 0),
      description: request.description,
      specText: request.specText,
      length: request.length ? new Decimal(request.length) : null,
      width: request.width ? new Decimal(request.width) : null,
      height: request.height ? new Decimal(request.height) : null,
      parentProductId: request.parentProductId,
    });

    const created = await this.productRepository.create(product);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      categoryId: created.categoryId,
      baseUnit: created.baseUnit,
      basePrice: created.basePrice.toFixed(3),
      costPrice: created.costPrice?.toFixed(3),
      reorderThreshold: created.reorderThreshold.toFixed(3),
      description: created.description ?? undefined,
      specText: created.specText ?? undefined,
      length: created.length ? created.length.toFixed(3) : null,
      width: created.width ? created.width.toFixed(3) : null,
      height: created.height ? created.height.toFixed(3) : null,
      parentProductId: created.parentProductId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}

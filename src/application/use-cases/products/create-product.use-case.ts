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
  length?: string;
  width?: string;
  height?: string;
}

export interface CreateProductResponse {
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
      baseUnit: request.baseUnit,
      basePrice: new Decimal(request.basePrice),
      length: request.length ? new Decimal(request.length) : undefined,
      width: request.width ? new Decimal(request.width) : undefined,
      height: request.height ? new Decimal(request.height) : undefined,
    });

    const created = await this.productRepository.create(product);

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      categoryId: created.categoryId,
      baseUnit: created.baseUnit,
      basePrice: created.basePrice.toFixed(3),
      length: created.length?.toFixed(3),
      width: created.width?.toFixed(3),
      height: created.height?.toFixed(3),
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";

export interface GetProductResponse {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  basePrice: string;
  length?: string;
  width?: string;
  height?: string;
  parentProductId?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: number): Promise<GetProductResponse> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      baseUnit: product.baseUnit,
      basePrice: product.basePrice.toFixed(3),
      length: product.length?.toFixed(3),
      width: product.width?.toFixed(3),
      height: product.height?.toFixed(3),
      parentProductId: product.parentProductId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

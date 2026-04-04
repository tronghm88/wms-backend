import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";

export interface ListProductsResponse {
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
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<ListProductsResponse[]> {
    const products = await this.productRepository.findAll();

    return products.map((product) => ({
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }
}

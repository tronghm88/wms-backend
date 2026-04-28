import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type {
  IProductRepository,
  FindAllProductsFilters,
} from "../../../domain/contracts/product.repository.interface";

export interface ListProductsResponse {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
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
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    filters?: FindAllProductsFilters,
  ): Promise<ListProductsResponse[]> {
    const products = await this.productRepository.findAll(filters);

    return products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      baseUnit: product.baseUnit,
      basePrice: product.basePrice.toFixed(3),
      costPrice: product.costPrice?.toFixed(3),
      reorderThreshold: product.reorderThreshold.toFixed(3),
      description: product.description ?? undefined,
      specText: product.specText ?? undefined,
      length: product.length ? product.length.toFixed(3) : null,
      width: product.width ? product.width.toFixed(3) : null,
      height: product.height ? product.height.toFixed(3) : null,
      parentProductId: product.parentProductId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }
}

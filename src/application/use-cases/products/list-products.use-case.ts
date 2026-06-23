import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type {
  IProductRepository,
  FindAllProductsFilters,
} from "../../../domain/contracts/product.repository.interface";
import { ProductResponseDto } from "../../../presentation/dtos/products/product-response.dto";

export interface ListProductsQuery extends FindAllProductsFilters {
  page?: number;
  limit?: number;
}

export interface ListProductsMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface ListProductsOutput {
  data: ProductResponseDto[];
  meta: ListProductsMeta;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query?: ListProductsQuery): Promise<ListProductsOutput> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.productRepository.findAll({
      keyword: query?.keyword,
      categoryId: query?.categoryId,
      baseUnit: query?.baseUnit,
      lowStock: query?.lowStock,
      skip,
      take: limit,
    });

    return {
      data: items.map((product) => ({
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
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }
}

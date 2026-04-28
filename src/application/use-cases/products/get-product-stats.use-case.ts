import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type {
  IProductRepository,
  ProductStats,
} from "../../../domain/contracts/product.repository.interface";

@Injectable()
export class GetProductStatsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<ProductStats> {
    return this.productRepository.getStats();
  }
}

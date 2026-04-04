import { Injectable, Inject } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import {
  ProductNotFoundException,
  ProductHasHistoryException,
} from "../../../domain/exceptions/product.exceptions";

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }

    const hasHistory = await this.productRepository.hasHistory(id);
    if (hasHistory) {
      throw new ProductHasHistoryException(id);
    }

    await this.productRepository.delete(id);
  }
}

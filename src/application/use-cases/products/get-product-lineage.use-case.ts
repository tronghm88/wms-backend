import { Inject, Injectable } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { ProductLineageEntity } from "../../../domain/entities/product-lineage.entity";

@Injectable()
export class GetProductLineageUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: number): Promise<ProductLineageEntity> {
    const lineage = await this.productRepository.findLineage(id);

    if (!lineage) {
      throw new ProductNotFoundException(id);
    }

    return lineage;
  }
}

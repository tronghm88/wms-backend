import { Inject, Injectable } from "@nestjs/common";
import { INVENTORY_REPOSITORY } from "../../../domain/contracts/inventory.repository.interface";
import type { IInventoryRepository } from "../../../domain/contracts/inventory.repository.interface";

export interface InventorySnapshotResponse {
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  quantity: string;
  unitCode: string;
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
  lastUpdated: Date;
}

@Injectable()
export class GetInventorySnapshotUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(): Promise<InventorySnapshotResponse[]> {
    const stocks = await this.inventoryRepository.findAllActiveStock();

    return stocks.map((stock) => ({
      productId: stock.productId,
      productCode: stock.productCode,
      productName: stock.productName,
      categoryName: stock.categoryName,
      quantity: stock.quantity.toFixed(3),
      unitCode: stock.unitCode,
      length: stock.length?.toFixed(3),
      width: stock.width?.toFixed(3),
      height: stock.height?.toFixed(3),
      weight: stock.weight?.toFixed(3),
      lastUpdated: stock.lastUpdated,
    }));
  }
}

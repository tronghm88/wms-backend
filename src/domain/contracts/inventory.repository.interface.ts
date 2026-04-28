import { InventoryEntity } from "../entities/inventory.entity";
import { Decimal } from "decimal.js";

export const INVENTORY_REPOSITORY = "INVENTORY_REPOSITORY";

export interface IInventoryRepository {
  findByProductId(productId: number): Promise<InventoryEntity | null>;
  findAll(): Promise<InventoryEntity[]>;
  findAllActiveStock(): Promise<InventorySnapshotItem[]>;
  updateQuantity(
    productId: number,
    delta: Decimal,
    unitCode: string,
  ): Promise<InventoryEntity>;
}

export interface InventorySnapshotItem {
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  quantity: Decimal;
  unitCode: string;
  length: Decimal | null;
  width: Decimal | null;
  height: Decimal | null;
  weight?: Decimal;
  lastUpdated: Date;
}

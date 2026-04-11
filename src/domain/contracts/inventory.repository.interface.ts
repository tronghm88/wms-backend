import { InventoryEntity } from "../entities/inventory.entity";
import { Decimal } from "decimal.js";

export const INVENTORY_REPOSITORY = "INVENTORY_REPOSITORY";

export interface IInventoryRepository {
  findByProductId(productId: number): Promise<InventoryEntity | null>;
  findAll(): Promise<InventoryEntity[]>;
  updateQuantity(
    productId: number,
    delta: Decimal,
    unitCode: string,
  ): Promise<InventoryEntity>;
}

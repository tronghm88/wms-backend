import { InventoryEntity } from '../entities/inventory.entity';

export interface IInventoryRepository {
  findByProductId(productId: number): Promise<InventoryEntity | null>;
  findAll(): Promise<InventoryEntity[]>;
  updateQuantity(productId: number, delta: Decimal, unitCode: string): Promise<InventoryEntity>;
}

import { Decimal } from 'decimal.js';

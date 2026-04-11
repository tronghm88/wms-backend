import { StockMovementEntity } from "../entities/stock-movement.entity";

export const STOCK_MOVEMENT_REPOSITORY = "STOCK_MOVEMENT_REPOSITORY";

export interface IStockMovementRepository {
  findById(id: number): Promise<StockMovementEntity | null>;
  findByProductId(productId: number): Promise<StockMovementEntity[]>;
  findByReference(
    referenceId: number,
    referenceType: string,
  ): Promise<StockMovementEntity[]>;
  create(
    movement: Omit<StockMovementEntity, "id" | "createdAt">,
  ): Promise<StockMovementEntity>;
}

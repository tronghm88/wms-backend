import { Decimal } from "decimal.js";
import { StockMovementEntity } from "../entities/stock-movement.entity";
import { StockMovementType } from "../enums";

export const STOCK_MOVEMENT_REPOSITORY = "STOCK_MOVEMENT_REPOSITORY";

export interface StockMovementSearchFilters {
  startDate?: Date;
  endDate?: Date;
  productId?: number;
  txType?: StockMovementType;
  performedBy?: number;
  ticketNo?: string;
  categoryId?: number;
}

export interface MovementHistoryFilters {
  productId: number;
  startDate: Date;
  endDate: Date;
  txTypes?: StockMovementType[];
  page?: number;
  limit?: number;
}

export interface AuditLogItem {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  txType: StockMovementType;
  referenceId: number;
  referenceType: string;
  ticketNo: string | null;
  deltaQty: Decimal;
  qtyAfter: Decimal;
  performedBy: number;
  performerName: string;
  unitCost: Decimal | null;
  note: string | null;
  createdAt: Date;
}

export interface RegisterMovementData {
  productId: number;
  txType: StockMovementType;
  referenceId: number;
  referenceType: string;
  deltaQty: Decimal;
  unitCode: string;
  performedBy: number;
  unitCost?: Decimal | null;
  note?: string | null;
}

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

  search(filters: StockMovementSearchFilters): Promise<AuditLogItem[]>;

  registerMovement(
    data: RegisterMovementData,
    tx?: unknown,
  ): Promise<StockMovementEntity>;

  /** Returns the qtyAfter of the last movement strictly before `beforeDate`, or Decimal(0) if none. */
  getQtyBeforeDate(productId: number, beforeDate: Date): Promise<Decimal>;

  /** Paginated movement history for a single product. */
  getMovementHistory(filters: MovementHistoryFilters): Promise<{
    items: AuditLogItem[];
    total: number;
  }>;
}

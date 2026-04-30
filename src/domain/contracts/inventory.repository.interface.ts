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
  getStockReport(filters: InventoryStockReportFilters): Promise<{
    items: ProductStockReportItem[];
    total: number;
  }>;
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

// ─── Inventory Stock Report ───────────────────────────────────────────────────

export type TicketTypeFilter = "receipt" | "issue" | "split";

export interface InventoryStockReportFilters {
  startDate: Date;
  endDate: Date;
  categoryId?: number;
  ticketType?: TicketTypeFilter;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface StockConversionItem {
  toUnit: string;
  toUnitLabel: string;
  factor: Decimal;
  openingStock: Decimal;
  closingStock: Decimal;
}

export interface ProductStockReportItem {
  productId: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  baseUnitLabel: string;
  openingStockBase: Decimal;
  closingStockBase: Decimal;
  conversions: StockConversionItem[];
}

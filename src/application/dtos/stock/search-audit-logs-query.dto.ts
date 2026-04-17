import { StockMovementType } from "../../../domain/enums";

export interface SearchAuditLogsQuery {
  startDate?: string;
  endDate?: string;
  productId?: number;
  txType?: StockMovementType;
  performedBy?: number;
  ticketNo?: string;
  categoryId?: number;
}

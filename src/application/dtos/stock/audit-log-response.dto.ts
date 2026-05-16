import { StockMovementType } from "../../../domain/enums";

export interface AuditLogResponse {
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
  deltaQty: string;
  qtyAfter: string;
  performedBy: number;
  performerName: string;
  unitCost: string | null;
  note: string | null;
  createdAt: Date;
}

import { Inject, Injectable } from "@nestjs/common";
import { STOCK_MOVEMENT_REPOSITORY } from "../../../domain/contracts/stock-movement.repository.interface";
import type { IStockMovementRepository } from "../../../domain/contracts/stock-movement.repository.interface";
import { SearchAuditLogsQuery } from "../../dtos/stock/search-audit-logs-query.dto";
import { AuditLogResponse } from "../../dtos/stock/audit-log-response.dto";

@Injectable()
export class SearchAuditLogsUseCase {
  constructor(
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(query: SearchAuditLogsQuery): Promise<AuditLogResponse[]> {
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      productId: query.productId ? Number(query.productId) : undefined,
      txType: query.txType,
      performedBy: query.performedBy ? Number(query.performedBy) : undefined,
      ticketNo: query.ticketNo,
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
    };

    const logs = await this.stockMovementRepository.search(filters);

    return logs.map((log) => ({
      id: log.id,
      productId: log.productId,
      productCode: log.productCode,
      productName: log.productName,
      categoryId: log.categoryId,
      categoryName: log.categoryName,
      txType: log.txType,
      referenceId: log.referenceId,
      referenceType: log.referenceType,
      ticketNo: log.ticketNo,
      deltaQty: log.deltaQty.toFixed(3),
      qtyAfter: log.qtyAfter.toFixed(3),
      performedBy: log.performedBy,
      performerName: log.performerName,
      note: log.note,
      createdAt: log.createdAt,
    }));
  }
}

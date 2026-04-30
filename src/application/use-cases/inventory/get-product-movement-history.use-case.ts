import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
  type AuditLogItem,
  type MovementHistoryFilters,
} from "../../../domain/contracts/stock-movement.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { StockMovementType } from "../../../domain/enums";
import type { TicketTypeFilter } from "../../../domain/contracts/inventory.repository.interface";

export interface GetProductMovementHistoryInput {
  productId: number;
  startDate?: string;
  endDate?: string;
  ticketType?: TicketTypeFilter;
  page?: number;
  limit?: number;
}

export interface MovementHistoryItemOutput {
  id: number;
  txType: StockMovementType;
  referenceId: number;
  referenceType: string;
  ticketNo: string | null;
  deltaQty: string;
  qtyAfter: string;
  performedBy: number;
  performerName: string;
  note: string | null;
  createdAt: Date;
}

export interface GetProductMovementHistoryResult {
  items: MovementHistoryItemOutput[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetProductMovementHistoryUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    input: GetProductMovementHistoryInput,
  ): Promise<GetProductMovementHistoryResult> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundException(
        `Product with id ${input.productId} not found`,
      );
    }

    const { startDate, endDate } = this.resolveDefaultDates(
      input.startDate,
      input.endDate,
    );
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const txTypes = this.resolveTxTypes(input.ticketType);

    const filters: MovementHistoryFilters = {
      productId: input.productId,
      startDate,
      endDate,
      page,
      limit,
    };
    if (txTypes) {
      filters.txTypes = txTypes;
    }

    const { items, total } =
      await this.stockMovementRepository.getMovementHistory(filters);

    return {
      items: items.map((m) => this.mapItem(m)),
      total,
      page,
      limit,
    };
  }

  private mapItem(m: AuditLogItem): MovementHistoryItemOutput {
    return {
      id: m.id,
      txType: m.txType,
      referenceId: m.referenceId,
      referenceType: m.referenceType,
      ticketNo: m.ticketNo,
      deltaQty: m.deltaQty.toFixed(3),
      qtyAfter: m.qtyAfter.toFixed(3),
      performedBy: m.performedBy,
      performerName: m.performerName,
      note: m.note,
      createdAt: m.createdAt,
    };
  }

  private resolveTxTypes(
    ticketType?: TicketTypeFilter,
  ): StockMovementType[] | null {
    if (!ticketType) return null;
    const map: Record<TicketTypeFilter, StockMovementType[]> = {
      receipt: [StockMovementType.IN],
      issue: [StockMovementType.OUT],
      split: [StockMovementType.SPLIT_IN, StockMovementType.SPLIT_OUT],
    };
    return map[ticketType];
  }

  /** Default: startDate = 30 days ago, endDate = now. */
  private resolveDefaultDates(
    startDateParam?: string,
    endDateParam?: string,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = endDateParam ? new Date(endDateParam) : now;
    let startDate: Date;
    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - 30);
      d.setUTCHours(0, 0, 0, 0);
      startDate = d;
    }
    return { startDate, endDate };
  }
}

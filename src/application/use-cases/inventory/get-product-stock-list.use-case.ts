import { Inject, Injectable } from "@nestjs/common";
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
  type ProductStockReportItem,
  type TicketTypeFilter,
} from "../../../domain/contracts/inventory.repository.interface";

export interface GetProductStockListInput {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  ticketType?: TicketTypeFilter;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface StockConversionOutput {
  toUnit: string;
  toUnitLabel: string;
  factor: string;
  openingStock: string;
  closingStock: string;
}

export interface ProductStockListOutput {
  productId: number;
  productCode: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  baseUnit: string;
  baseUnitLabel: string;
  openingStockBase: string;
  closingStockBase: string;
  conversions: StockConversionOutput[];
}

export interface GetProductStockListResult {
  items: ProductStockListOutput[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetProductStockListUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    input: GetProductStockListInput,
  ): Promise<GetProductStockListResult> {
    const { startDate, endDate } = this.resolveDefaultDates(
      input.startDate,
      input.endDate,
    );
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { items, total } = await this.inventoryRepository.getStockReport({
      startDate,
      endDate,
      categoryId: input.categoryId,
      ticketType: input.ticketType,
      keyword: input.keyword,
      page,
      limit,
    });

    return {
      items: items.map((item) => this.mapItem(item)),
      total,
      page,
      limit,
    };
  }

  private mapItem(item: ProductStockReportItem): ProductStockListOutput {
    return {
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      baseUnit: item.baseUnit,
      baseUnitLabel: item.baseUnitLabel,
      openingStockBase: item.openingStockBase.toFixed(3),
      closingStockBase: item.closingStockBase.toFixed(3),
      conversions: item.conversions.map((c) => ({
        toUnit: c.toUnit,
        toUnitLabel: c.toUnitLabel,
        factor: c.factor.toFixed(3),
        openingStock: c.openingStock.toFixed(3),
        closingStock: c.closingStock.toFixed(3),
      })),
    };
  }

  /** Defaults: startDate = first day of current month UTC, endDate = now. */
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
      // First day of current month at 00:00:00 UTC
      startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
    }

    return { startDate, endDate };
  }
}

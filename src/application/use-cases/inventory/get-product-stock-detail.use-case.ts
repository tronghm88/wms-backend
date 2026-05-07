import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { type TicketTypeFilter } from "../../../domain/contracts/inventory.repository.interface";

import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
} from "../../../domain/contracts/stock-movement.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import {
  GetProductStockListUseCase,
  type ProductStockListOutput,
  type StockConversionOutput,
} from "./get-product-stock-list.use-case";
import type { AuditLogItem } from "../../../domain/contracts/stock-movement.repository.interface";
import { StockMovementType } from "../../../domain/enums";

export interface MovementHistoryOutput {
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

export interface ProductStockDetailOutput extends ProductStockListOutput {
  description: string | null;
  specText: string | null;
  basePrice: string;
  costPrice: string | null;
  reorderThreshold: string;
  recentMovements: MovementHistoryOutput[];
}

export interface GetProductStockDetailInput {
  productId: number;
  startDate?: string;
  endDate?: string;
  ticketType?: TicketTypeFilter;
}

@Injectable()
export class GetProductStockDetailUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly getProductStockListUseCase: GetProductStockListUseCase,
  ) {}

  async execute(
    input: GetProductStockDetailInput,
  ): Promise<ProductStockDetailOutput> {
    // Validate product exists
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

    // Fetch stock report for just this one product (limit = 1)
    const stockResult = await this.getProductStockListUseCase.execute({
      startDate: input.startDate,
      endDate: input.endDate,
      ticketType: input.ticketType,
      keyword: product.code,
      page: 1,
      limit: 1,
    });

    // Fallback if the stock report didn't return this product (e.g. category filter mismatch)
    let stockItem: ProductStockListOutput;
    if (
      stockResult.items.length > 0 &&
      stockResult.items[0].productId === input.productId
    ) {
      stockItem = stockResult.items[0];
    } else {
      // Product exists but no stock data → zeros
      stockItem = {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        categoryId: product.categoryId,
        categoryName: product.categoryName ?? "",
        baseUnit: product.baseUnit,
        baseUnitLabel: "",
        openingStockBase: "0.000",
        closingStockBase: "0.000",
        conversions: [] as StockConversionOutput[],
      };
    }

    // Fetch last 30 days of movement history (default)
    const { items: movements } =
      await this.stockMovementRepository.getMovementHistory({
        productId: input.productId,
        startDate,
        endDate,
        page: 1,
        limit: 50,
      });

    return {
      ...stockItem,
      description: product.description ?? null,
      specText: product.specText ?? null,
      basePrice: product.basePrice.toFixed(3),
      costPrice: product.costPrice ? product.costPrice.toFixed(3) : null,
      reorderThreshold: product.reorderThreshold.toFixed(3),
      recentMovements: movements.map((m) => this.mapMovement(m)),
    };
  }

  private mapMovement(m: AuditLogItem): MovementHistoryOutput {
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
      startDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
    }
    return { startDate, endDate };
  }
}

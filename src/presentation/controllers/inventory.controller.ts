import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetInventorySnapshotUseCase } from "../../application/use-cases/inventory/get-inventory-snapshot.use-case";
import { GetProductStockListUseCase } from "../../application/use-cases/inventory/get-product-stock-list.use-case";
import { GetProductStockDetailUseCase } from "../../application/use-cases/inventory/get-product-stock-detail.use-case";
import { GetProductMovementHistoryUseCase } from "../../application/use-cases/inventory/get-product-movement-history.use-case";
import { InventorySnapshotResponseDto } from "../dtos/inventory/inventory-snapshot-response.dto";
import { InventoryStockQueryDto } from "../dtos/inventory/inventory-stock-query.dto";
import {
  ProductStockListItemDto,
  ProductStockListResponseDto,
} from "../dtos/inventory/product-stock-list-response.dto";
import { ProductStockDetailDto } from "../dtos/inventory/product-stock-detail-response.dto";
import { MovementHistoryQueryDto } from "../dtos/inventory/movement-history-query.dto";
import { RecentMovementItemDto } from "../dtos/inventory/movement-history-item.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Inventory")
@Controller("api/v1/inventory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class InventoryController {
  constructor(
    private readonly getInventorySnapshotUseCase: GetInventorySnapshotUseCase,
    private readonly getProductStockListUseCase: GetProductStockListUseCase,
    private readonly getProductStockDetailUseCase: GetProductStockDetailUseCase,
    private readonly getProductMovementHistoryUseCase: GetProductMovementHistoryUseCase,
  ) {}

  // ─── Existing endpoint ──────────────────────────────────────────────────────

  @Get("snapshot")
  @RequirePermissions(Permissions.INVENTORY_VIEW)
  @ApiOperation({
    summary: "Get a full inventory snapshot optimized for bulk data",
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns a full inventory snapshot with numeric fields as strings",
    type: [InventorySnapshotResponseDto],
  })
  async getSnapshot(): Promise<InventorySnapshotResponseDto[]> {
    const stocks = await this.getInventorySnapshotUseCase.execute();
    return stocks.map((stock) => new InventorySnapshotResponseDto(stock));
  }

  // ─── New stock report endpoints ─────────────────────────────────────────────

  @Get("stock")
  @RequirePermissions(Permissions.INVENTORY_VIEW)
  @ApiOperation({
    summary:
      "List products with opening & closing stock in base unit and all conversion units",
    description:
      "Supports filtering by date range (default: current month), category, ticket type (receipt/issue/split), and keyword. Results are paginated.",
  })
  @ApiResponse({
    status: 200,
    description: "Paginated list of products with stock statistics.",
    type: ProductStockListResponseDto,
  })
  async getStockList(
    @Query() query: InventoryStockQueryDto,
  ): Promise<ProductStockListResponseDto> {
    const result = await this.getProductStockListUseCase.execute(query);
    return {
      items: result.items.map((item) => new ProductStockListItemDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get("stock/:productId")
  @RequirePermissions(Permissions.INVENTORY_VIEW)
  @ApiOperation({
    summary:
      "Get full product detail with opening/closing stock and recent movement history",
    description:
      "Returns all product fields, stock in base and conversion units, and up to 50 movements within the selected date range.",
  })
  @ApiParam({ name: "productId", type: Number, description: "Product ID." })
  @ApiResponse({
    status: 200,
    description: "Full product stock detail.",
    type: ProductStockDetailDto,
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  async getStockDetail(
    @Param("productId", ParseIntPipe) productId: number,
    @Query() query: InventoryStockQueryDto,
  ): Promise<ProductStockDetailDto> {
    const result = await this.getProductStockDetailUseCase.execute({
      productId,
      startDate: query.startDate,
      endDate: query.endDate,
      categoryId: query.categoryId,
      ticketType: query.ticketType,
    });
    return new ProductStockDetailDto(result);
  }

  @Get("stock/:productId/movements")
  @RequirePermissions(Permissions.INVENTORY_VIEW)
  @ApiOperation({
    summary: "Get paginated in/out/split movement history for a product",
    description:
      "Default date range is the last 30 days. Supports filtering by ticket type and pagination.",
  })
  @ApiParam({ name: "productId", type: Number, description: "Product ID." })
  @ApiResponse({
    status: 200,
    description: "Paginated movement history.",
  })
  @ApiResponse({ status: 404, description: "Product not found." })
  async getMovementHistory(
    @Param("productId", ParseIntPipe) productId: number,
    @Query() query: MovementHistoryQueryDto,
  ): Promise<{
    items: RecentMovementItemDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.getProductMovementHistoryUseCase.execute({
      productId,
      startDate: query.startDate,
      endDate: query.endDate,
      ticketType: query.ticketType,
      page: query.page,
      limit: query.limit,
    });
    return {
      items: result.items.map((item) => new RecentMovementItemDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}

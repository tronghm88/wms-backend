import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { InventoryRepository } from "../database/repositories/inventory.repository";
import { StockMovementRepository } from "../database/repositories/stock-movement.repository";
import { INVENTORY_REPOSITORY } from "../../domain/contracts/inventory.repository.interface";
import { STOCK_MOVEMENT_REPOSITORY } from "../../domain/contracts/stock-movement.repository.interface";
import { GetInventorySnapshotUseCase } from "../../application/use-cases/inventory/get-inventory-snapshot.use-case";
import { SearchAuditLogsUseCase } from "../../application/use-cases/stock/search-audit-logs.use-case";
import { GetProductStockListUseCase } from "../../application/use-cases/inventory/get-product-stock-list.use-case";
import { GetProductStockDetailUseCase } from "../../application/use-cases/inventory/get-product-stock-detail.use-case";
import { GetProductMovementHistoryUseCase } from "../../application/use-cases/inventory/get-product-movement-history.use-case";
import { ExportStockReportUseCase } from "../../application/use-cases/inventory/export-stock-report.use-case";
import { ExcelExportService } from "../services/excel-export.service";

import { InventoryController } from "../../presentation/controllers/inventory.controller";
import { AuditLogController } from "../../presentation/controllers/audit-log.controller";
import { ProductsModule } from "../products/products.module";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [PrismaModule, forwardRef(() => ProductsModule), CategoriesModule],
  controllers: [InventoryController, AuditLogController],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: InventoryRepository,
    },
    {
      provide: STOCK_MOVEMENT_REPOSITORY,
      useClass: StockMovementRepository,
    },
    GetInventorySnapshotUseCase,
    SearchAuditLogsUseCase,
    GetProductStockListUseCase,
    GetProductStockDetailUseCase,
    GetProductMovementHistoryUseCase,
    ExcelExportService,
    ExportStockReportUseCase,
  ],
  exports: [
    INVENTORY_REPOSITORY,
    STOCK_MOVEMENT_REPOSITORY,
    GetInventorySnapshotUseCase,
    SearchAuditLogsUseCase,
    GetProductStockListUseCase,
    GetProductStockDetailUseCase,
    GetProductMovementHistoryUseCase,
    ExcelExportService,
    ExportStockReportUseCase,
  ],
})
export class StockModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { InventoryRepository } from "../database/repositories/inventory.repository";
import { StockMovementRepository } from "../database/repositories/stock-movement.repository";
import { INVENTORY_REPOSITORY } from "../../domain/contracts/inventory.repository.interface";
import { STOCK_MOVEMENT_REPOSITORY } from "../../domain/contracts/stock-movement.repository.interface";
import { GetInventorySnapshotUseCase } from "../../application/use-cases/inventory/get-inventory-snapshot.use-case";

import { InventoryController } from "../../presentation/controllers/inventory.controller";

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
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
  ],
  exports: [
    INVENTORY_REPOSITORY,
    STOCK_MOVEMENT_REPOSITORY,
    GetInventorySnapshotUseCase,
  ],
})
export class StockModule {}

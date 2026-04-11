import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { InventoryRepository } from "../database/repositories/inventory.repository";
import { StockMovementRepository } from "../database/repositories/stock-movement.repository";
import { INVENTORY_REPOSITORY } from "../../domain/contracts/inventory.repository.interface";
import { STOCK_MOVEMENT_REPOSITORY } from "../../domain/contracts/stock-movement.repository.interface";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: INVENTORY_REPOSITORY,
      useClass: InventoryRepository,
    },
    {
      provide: STOCK_MOVEMENT_REPOSITORY,
      useClass: StockMovementRepository,
    },
  ],
  exports: [INVENTORY_REPOSITORY, STOCK_MOVEMENT_REPOSITORY],
})
export class StockModule {}

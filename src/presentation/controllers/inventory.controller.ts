import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetInventorySnapshotUseCase } from "../../application/use-cases/inventory/get-inventory-snapshot.use-case";
import { InventorySnapshotResponseDto } from "../dtos/inventory/inventory-snapshot-response.dto";
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
  ) {}

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
}

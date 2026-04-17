import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RequirePermissions, RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";
import { SearchAuditLogsUseCase } from "../../application/use-cases/stock/search-audit-logs.use-case";
import { SearchAuditLogsQueryDto } from "../dtos/audit-log/search-audit-logs-query.dto";
import { AuditLogResponseDto } from "../dtos/audit-log/audit-log-response.dto";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller("api/v1/audit-logs")
export class AuditLogController {
  constructor(
    private readonly searchAuditLogsUseCase: SearchAuditLogsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.AUDIT_TRAIL_VIEW)
  @ApiOperation({ summary: "Search historical movements with dynamic filters" })
  @ApiResponse({
    status: 200,
    description: "List of audit log entries matching filters",
    type: [AuditLogResponseDto],
  })
  async search(
    @Query() query: SearchAuditLogsQueryDto,
  ): Promise<AuditLogResponseDto[]> {
    const logs = await this.searchAuditLogsUseCase.execute(query);
    return logs.map((log) => new AuditLogResponseDto(log));
  }
}

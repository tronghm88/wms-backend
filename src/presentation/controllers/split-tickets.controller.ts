import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Get,
  Delete,
  Query,
  Request,
  UseGuards,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { AddSplitTicketLinesUseCase } from "../../application/use-cases/split-tickets/add-split-ticket-lines.use-case";
import { ConfirmSplitTicketUseCase } from "../../application/use-cases/split-tickets/confirm-split-ticket.use-case";
import { CancelSplitTicketUseCase } from "../../application/use-cases/split-tickets/cancel-split-ticket.use-case";
import { ListSplitTicketsUseCase } from "../../application/use-cases/split-tickets/list-split-tickets.use-case";
import { UpdateSplitTicketLineUseCase } from "../../application/use-cases/split-tickets/update-split-ticket-line.use-case";
import { DeleteSplitTicketLineUseCase } from "../../application/use-cases/split-tickets/delete-split-ticket-line.use-case";
import { UpdateSplitTicketUseCase } from "../../application/use-cases/split-tickets/update-split-ticket.use-case";
import { GetSplitTicketStatsUseCase } from "../../application/use-cases/split-tickets/get-split-ticket-stats.use-case";
import { ExportSplitTicketUseCase } from "../../application/use-cases/split-tickets/export-split-ticket.use-case";
import { GetSplitTicketUseCase } from "../../application/use-cases/split-tickets/get-split-ticket.use-case";
import { CreateSplitTicketDto } from "../dtos/split-tickets/create-split-ticket.dto";
import { AddSplitTicketLinesDto } from "../dtos/split-tickets/add-split-ticket-lines.dto";
import { UpdateSplitLineRequestDto } from "../dtos/split-tickets/update-split-line-request.dto";
import { UpdateSplitTicketDto } from "../dtos/split-tickets/update-split-ticket.dto";
import { GetSplitTicketsDto } from "../dtos/split-tickets/get-split-tickets.dto";
import { GetSplitStatsQueryDto } from "../dtos/split-tickets/get-split-stats-query.dto";
import { SplitStatsResponseDto } from "../dtos/split-tickets/split-stats-response.dto";
import {
  SplitTicketResponseDto,
  SplitTicketLineResponseDto,
} from "../dtos/split-tickets/split-ticket-response.dto";
import { SplitTicketDetailsResponseDto } from "../dtos/split-tickets/split-ticket-details-response.dto";
import { PaginatedSplitTicketResponseDto } from "../dtos/split-tickets/paginated-split-ticket-response.dto";
import { CancelSplitTicketResponseDto } from "../dtos/split-tickets/cancel-split-ticket-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Split Tickets")
@Controller("api/v1/split-tickets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class SplitTicketsController {
  constructor(
    private readonly createSplitTicketUseCase: CreateSplitTicketUseCase,
    private readonly addSplitTicketLinesUseCase: AddSplitTicketLinesUseCase,
    private readonly confirmSplitTicketUseCase: ConfirmSplitTicketUseCase,
    private readonly cancelSplitTicketUseCase: CancelSplitTicketUseCase,
    private readonly listSplitTicketsUseCase: ListSplitTicketsUseCase,
    private readonly getSplitTicketUseCase: GetSplitTicketUseCase,
    private readonly updateSplitTicketLineUseCase: UpdateSplitTicketLineUseCase,
    private readonly deleteSplitTicketLineUseCase: DeleteSplitTicketLineUseCase,
    private readonly updateSplitTicketUseCase: UpdateSplitTicketUseCase,
    private readonly getSplitTicketStatsUseCase: GetSplitTicketStatsUseCase,
    private readonly exportSplitTicketUseCase: ExportSplitTicketUseCase,
  ) {}

  @Get("stats")
  @RequirePermissions(Permissions.SPLITS_VIEW)
  @ApiOperation({ summary: "Get Split Ticket statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns statistics for Split Tickets",
    type: SplitStatsResponseDto,
  })
  async getStats(
    @Query() query: GetSplitStatsQueryDto,
  ): Promise<SplitStatsResponseDto> {
    const stats = await this.getSplitTicketStatsUseCase.execute(
      query.fromDate,
      query.toDate,
    );
    return new SplitStatsResponseDto(stats);
  }

  @Get()
  @RequirePermissions(Permissions.SPLITS_VIEW)
  @ApiOperation({ summary: "Get all split tickets" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a paginated list of split tickets",
    type: PaginatedSplitTicketResponseDto,
  })
  async findAll(
    @Query() query: GetSplitTicketsDto,
  ): Promise<PaginatedSplitTicketResponseDto> {
    const result = await this.listSplitTicketsUseCase.execute({
      ...query,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
    return {
      data: result.data.map((ticket) => new SplitTicketResponseDto(ticket)),
      metadata: result.meta,
    };
  }

  @Get(":id")
  @RequirePermissions(Permissions.SPLITS_VIEW)
  @ApiOperation({ summary: "Get Split Ticket details by ID" })
  @ApiParam({ name: "id", type: Number, description: "Split Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Returns the Split Ticket details including all child lines with product information",
    type: SplitTicketDetailsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split Ticket not found",
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SplitTicketDetailsResponseDto> {
    const result = await this.getSplitTicketUseCase.execute(id);
    return new SplitTicketDetailsResponseDto(result);
  }

  @Post()
  @RequirePermissions(Permissions.SPLITS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new Split Ticket Draft" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Split Ticket Draft successfully created",
    type: SplitTicketResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Source product not found",
  })
  async create(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateSplitTicketDto,
  ): Promise<SplitTicketResponseDto> {
    const ticket = await this.createSplitTicketUseCase.execute(
      dto,
      req.user.id,
    );
    return new SplitTicketResponseDto(ticket);
  }

  @Patch(":id")
  @RequirePermissions(Permissions.SPLITS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update basic information of a Split Ticket" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Split Ticket basic information successfully updated",
    type: SplitTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or Ticket is not in DRAFT status",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSplitTicketDto,
  ): Promise<SplitTicketResponseDto> {
    const ticket = await this.updateSplitTicketUseCase.execute(id, dto);
    return new SplitTicketResponseDto(ticket);
  }

  @Post(":id/lines")
  @RequirePermissions(Permissions.SPLITS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add multiple child lines to a split ticket" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lines successfully added to the split ticket",
    type: SplitTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or status",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket or product not found",
  })
  async addLines(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AddSplitTicketLinesDto,
  ): Promise<SplitTicketResponseDto> {
    const ticket = await this.addSplitTicketLinesUseCase.execute(id, dto);
    return new SplitTicketResponseDto(ticket);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(Permissions.SPLITS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an existing line item in a Split Ticket" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Line item successfully updated",
    type: SplitTicketLineResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split Ticket or Line not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or Ticket is not in PENDING (DRAFT) status",
  })
  async updateLine(
    @Param("id", ParseIntPipe) id: number,
    @Param("lineId", ParseIntPipe) lineId: number,
    @Body() dto: UpdateSplitLineRequestDto,
  ): Promise<SplitTicketLineResponseDto> {
    const line = await this.updateSplitTicketLineUseCase.execute(
      id,
      lineId,
      dto,
    );
    return new SplitTicketLineResponseDto(line);
  }

  @Delete(":id/lines/:lineId")
  @RequirePermissions(Permissions.SPLITS_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a line item from a Split Ticket" })
  @ApiParam({ name: "id", description: "Split ticket ID" })
  @ApiParam({ name: "lineId", description: "Split ticket line ID" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Line item deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket or line not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in PENDING (DRAFT) status",
  })
  async deleteLine(
    @Param("id", ParseIntPipe) id: number,
    @Param("lineId", ParseIntPipe) lineId: number,
  ): Promise<void> {
    await this.deleteSplitTicketLineUseCase.execute(id, lineId);
  }

  @Put(":id/confirm")
  @RequirePermissions(Permissions.SPLITS_CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Confirm a split ticket to execute stock movements",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Split ticket confirmed and stock updated",
    type: SplitTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid status or insufficient stock",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split ticket not found",
  })
  async confirm(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<SplitTicketResponseDto> {
    const ticket = await this.confirmSplitTicketUseCase.execute(
      id,
      req.user.id,
    );
    return new SplitTicketResponseDto(ticket);
  }

  @Post(":id/cancel")
  @RequirePermissions(Permissions.SPLITS_CANCEL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Cancel a confirmed split ticket to undo product breakdown",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Split ticket cancelled and stock movements reversed",
    type: CancelSplitTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid status (only confirmed can be cancelled)",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split ticket not found",
  })
  async cancel(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<CancelSplitTicketResponseDto> {
    const { ticket, warnings } = await this.cancelSplitTicketUseCase.execute(
      id,
      req.user.id,
    );
    return new CancelSplitTicketResponseDto(ticket, warnings);
  }

  @Get(":id/export")
  @RequirePermissions(Permissions.SPLITS_VIEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Export a split ticket to Excel (.xlsx)" })
  @ApiParam({ name: "id", description: "Split ticket ID" })
  @ApiProduces(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the split ticket as an Excel file",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split ticket not found",
  })
  async exportToExcel(
    @Param("id", ParseIntPipe) id: number,
    @Res() res: import("express").Response,
  ): Promise<void> {
    const { buffer, filename } =
      await this.exportSplitTicketUseCase.execute(id);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(buffer);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Decimal } from "decimal.js";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { AddReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/add-receipt-line.use-case";
import { UpdateReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/update-receipt-line.use-case";
import { DeleteReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-line.use-case";
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { GetReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/get-receipt-ticket.use-case";
import { ConfirmReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/confirm-receipt-ticket.use-case";
import { CancelReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/cancel-receipt-ticket.use-case";
import { DeleteReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-ticket.use-case";
import { UpdateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/update-receipt-ticket.use-case";
import { GetReceiptTicketStatsUseCase } from "../../application/use-cases/receipt-tickets/get-receipt-ticket-stats.use-case";
import { CreateReceiptTicketDto } from "../../application/dtos/create-receipt-ticket.dto";
import { CreateReceiptTicketRequestDto } from "../dtos/receipt-tickets/create-receipt-ticket-request.dto";
import { GetReceiptTicketsDto } from "../dtos/receipt-tickets/get-receipt-tickets.dto";
import { AddReceiptLineRequestDto } from "../dtos/receipt-tickets/add-receipt-line-request.dto";
import { UpdateReceiptLineRequestDto } from "../dtos/receipt-tickets/update-receipt-line-request.dto";
import { UpdateReceiptTicketRequestDto } from "../dtos/receipt-tickets/update-receipt-ticket-request.dto";
import { CancelReceiptTicketResponseDto } from "../dtos/receipt-tickets/cancel-receipt-ticket-response.dto";
import { ReceiptTicketResponseDto } from "../dtos/receipt-ticket-response.dto";
import { ReceiptTicketLineResponseDto } from "../dtos/receipt-tickets/receipt-ticket-line-response.dto";
import { ReceiptTicketDetailsResponseDto } from "../dtos/receipt-tickets/receipt-ticket-details-response.dto";
import { GetReceiptStatsQueryDto } from "../dtos/receipt-tickets/get-receipt-stats-query.dto";
import { ReceiptStatsResponseDto } from "../dtos/receipt-tickets/receipt-stats-response.dto";
import { PaginatedReceiptTicketResponseDto } from "../dtos/receipt-tickets/paginated-receipt-ticket-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";
import { UserRole } from "../../domain/enums";

@ApiTags("Receipt Tickets")
@Controller("api/v1/receipt-tickets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReceiptTicketsController {
  constructor(
    private readonly createReceiptTicketUseCase: CreateReceiptTicketUseCase,
    private readonly addReceiptLineUseCase: AddReceiptLineUseCase,
    private readonly updateReceiptLineUseCase: UpdateReceiptLineUseCase,
    private readonly deleteReceiptLineUseCase: DeleteReceiptLineUseCase,
    private readonly listReceiptTicketsUseCase: ListReceiptTicketsUseCase,
    private readonly getReceiptTicketUseCase: GetReceiptTicketUseCase,
    private readonly confirmReceiptTicketUseCase: ConfirmReceiptTicketUseCase,
    private readonly cancelReceiptTicketUseCase: CancelReceiptTicketUseCase,
    private readonly deleteReceiptTicketUseCase: DeleteReceiptTicketUseCase,
    private readonly updateReceiptTicketUseCase: UpdateReceiptTicketUseCase,
    private readonly getReceiptTicketStatsUseCase: GetReceiptTicketStatsUseCase,
  ) {}

  @Put(":id/confirm")
  @RequirePermissions(Permissions.RECEIPTS_CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm a Goods Receipt and update stock" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Goods Receipt successfully confirmed",
    type: ReceiptTicketResponseDto,
  })
  async confirm(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<ReceiptTicketResponseDto> {
    const ticket = await this.confirmReceiptTicketUseCase.execute(
      id,
      req.user.id,
    );
    return new ReceiptTicketResponseDto(ticket);
  }

  @Post(":id/cancel")
  @RequirePermissions(Permissions.RECEIPTS_CANCEL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Cancel a confirmed Goods Receipt and revert stock",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Goods Receipt successfully cancelled",
    type: CancelReceiptTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Receipt Ticket is not in CONFIRMED status",
  })
  async cancel(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<CancelReceiptTicketResponseDto> {
    const { ticket, warnings } = await this.cancelReceiptTicketUseCase.execute(
      id,
      req.user.id,
    );
    return new CancelReceiptTicketResponseDto(ticket, warnings);
  }

  @Delete(":id")
  @RequirePermissions(Permissions.RECEIPTS_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a Receipt Ticket (Draft or Confirmed)" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Receipt Ticket successfully deleted",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket not found",
  })
  async delete(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { role: UserRole; id: number } },
  ): Promise<null> {
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;
    await this.deleteReceiptTicketUseCase.execute(id, isAdmin, req.user.id);
    return null;
  }

  @Get()
  @RequirePermissions(Permissions.RECEIPTS_VIEW)
  @ApiOperation({ summary: "List all Goods Receipts with filters" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a paginated list of Goods Receipts",
    type: PaginatedReceiptTicketResponseDto,
  })
  async findAll(
    @Query() query: GetReceiptTicketsDto,
  ): Promise<PaginatedReceiptTicketResponseDto> {
    const result = await this.listReceiptTicketsUseCase.execute({
      ...query,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
    return {
      data: result.data.map((ticket) => new ReceiptTicketResponseDto(ticket)),
      metadata: result.meta,
    };
  }


  @Get(":id")
  @RequirePermissions(Permissions.RECEIPTS_VIEW)
  @ApiOperation({ summary: "Get Goods Receipt details by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns the Goods Receipt details including line items",
    type: ReceiptTicketDetailsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket not found",
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ReceiptTicketDetailsResponseDto> {
    const result = await this.getReceiptTicketUseCase.execute(id);
    return new ReceiptTicketDetailsResponseDto(result);
  }

  @Post()
  @RequirePermissions(Permissions.RECEIPTS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new Goods Receipt Draft" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Goods Receipt Draft successfully created",
    type: ReceiptTicketResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  async create(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateReceiptTicketRequestDto,
  ): Promise<ReceiptTicketResponseDto> {
    const appDto: CreateReceiptTicketDto = {
      note: dto.note,
      supplierName: dto.supplierName,
      invoiceNo: dto.invoiceNo,
      invoiceDate: dto.invoiceDate,
      lines: dto.lines.map((line) => ({
        ...line,
        quantity: new Decimal(line.quantity),
        lengthM: line.lengthM ? new Decimal(line.lengthM) : undefined,
      })),
    };
    const ticket = await this.createReceiptTicketUseCase.execute(
      appDto,
      req.user.id,
    );
    return new ReceiptTicketResponseDto(ticket);
  }

  @Patch(":id")
  @RequirePermissions(Permissions.RECEIPTS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update Receipt Ticket header metadata" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Receipt Ticket header successfully updated",
    type: ReceiptTicketResponseDto,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { role: UserRole; id: number } },
    @Body() dto: UpdateReceiptTicketRequestDto,
  ): Promise<ReceiptTicketResponseDto> {
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;
    const ticket = await this.updateReceiptTicketUseCase.execute(
      id,
      dto,
      isAdmin,
    );
    return new ReceiptTicketResponseDto(ticket);
  }

  @Post(":id/lines")
  @RequirePermissions(Permissions.RECEIPTS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a new line item to a Receipt Ticket" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Line item successfully added",
    type: ReceiptTicketLineResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket or Product not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or Ticket is not in DRAFT status",
  })
  async addLine(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { role: UserRole; id: number } },
    @Body() dto: AddReceiptLineRequestDto,
  ): Promise<ReceiptTicketLineResponseDto> {
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;
    const line = await this.addReceiptLineUseCase.execute(
      id,
      {
        ...dto,
        quantity: new Decimal(dto.quantity),
        lengthM: dto.lengthM ? new Decimal(dto.lengthM) : undefined,
      },
      isAdmin,
      req.user.id,
    );
    return new ReceiptTicketLineResponseDto(line);
  }

  @Patch(":id/lines/:lineId")
  @RequirePermissions(Permissions.RECEIPTS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an existing line item in a Receipt Ticket" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Line item successfully updated",
    type: ReceiptTicketLineResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket or Line not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or Ticket is not in DRAFT status",
  })
  async updateLine(
    @Param("id", ParseIntPipe) id: number,
    @Param("lineId", ParseIntPipe) lineId: number,
    @Request() req: { user: { role: UserRole; id: number } },
    @Body() dto: UpdateReceiptLineRequestDto,
  ): Promise<ReceiptTicketLineResponseDto> {
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;
    const line = await this.updateReceiptLineUseCase.execute(
      id,
      lineId,
      {
        ...dto,
        quantity: dto.quantity ? new Decimal(dto.quantity) : undefined,
        lengthM: dto.lengthM ? new Decimal(dto.lengthM) : undefined,
      },
      isAdmin,
      req.user.id,
    );
    return new ReceiptTicketLineResponseDto(line);
  }

  @Delete(":id/lines/:lineId")
  @RequirePermissions(Permissions.RECEIPTS_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a line item from a Receipt Ticket" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Line item successfully deleted",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Receipt Ticket or Line not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or Ticket is not in DRAFT status",
  })
  async deleteLine(
    @Param("id", ParseIntPipe) id: number,
    @Param("lineId", ParseIntPipe) lineId: number,
    @Request() req: { user: { role: UserRole; id: number } },
  ): Promise<null> {
    const isAdmin =
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN;
    await this.deleteReceiptLineUseCase.execute(
      id,
      lineId,
      isAdmin,
      req.user.id,
    );
    return null;
  }

  @Get("stats")
  @RequirePermissions(Permissions.RECEIPTS_VIEW)
  @ApiOperation({ summary: "Get Receipt Ticket statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns statistics for Receipt Tickets",
    type: ReceiptStatsResponseDto,
  })
  async getStats(
    @Query() query: GetReceiptStatsQueryDto,
  ): Promise<ReceiptStatsResponseDto> {
    const stats = await this.getReceiptTicketStatsUseCase.execute(
      query.fromDate,
      query.toDate,
    );
    return new ReceiptStatsResponseDto(stats);
  }
}

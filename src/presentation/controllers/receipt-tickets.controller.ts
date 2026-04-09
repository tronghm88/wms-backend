import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseIntPipe,
  Post,
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
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { CreateReceiptTicketDto } from "../../application/dtos/create-receipt-ticket.dto";
import { GetReceiptTicketsDto } from "../dtos/receipt-tickets/get-receipt-tickets.dto";
import { GetReceiptTicketsResponseDto } from "../dtos/receipt-tickets/get-receipt-tickets-response.dto";
import { AddReceiptLineRequestDto } from "../dtos/receipt-tickets/add-receipt-line-request.dto";
import { UpdateReceiptLineRequestDto } from "../dtos/receipt-tickets/update-receipt-line-request.dto";
import { ReceiptTicketResponseDto } from "../dtos/receipt-ticket-response.dto";
import { ReceiptTicketLineResponseDto } from "../dtos/receipt-tickets/receipt-ticket-line-response.dto";
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
    private readonly listReceiptTicketsUseCase: ListReceiptTicketsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.RECEIPTS_VIEW)
  @ApiOperation({ summary: "List all Goods Receipts with filters" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a paginated list of Goods Receipts",
    type: GetReceiptTicketsResponseDto,
  })
  async findAll(
    @Query() query: GetReceiptTicketsDto,
  ): Promise<GetReceiptTicketsResponseDto> {
    const result = await this.listReceiptTicketsUseCase.execute({
      ...query,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
    return {
      statusCode: HttpStatus.OK,
      data: result.data.map((ticket) => new ReceiptTicketResponseDto(ticket)),
      meta: result.meta,
    };
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
    @Body() dto: CreateReceiptTicketDto,
  ): Promise<ReceiptTicketResponseDto> {
    const ticket = await this.createReceiptTicketUseCase.execute(
      dto,
      req.user.id,
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
    @Body() dto: AddReceiptLineRequestDto,
  ): Promise<ReceiptTicketLineResponseDto> {
    const line = await this.addReceiptLineUseCase.execute(id, {
      ...dto,
      quantity: new Decimal(dto.quantity),
      lengthM: dto.lengthM ? new Decimal(dto.lengthM) : undefined,
    });
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
    @Request() req: { user: { role: UserRole } },
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
    );
    return new ReceiptTicketLineResponseDto(line);
  }
}

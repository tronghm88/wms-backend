import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { CreateReceiptTicketDto } from "../../application/dtos/create-receipt-ticket.dto";
import { GetReceiptTicketsDto } from "../dtos/receipt-tickets/get-receipt-tickets.dto";
import { AddReceiptLineRequestDto } from "../dtos/receipt-tickets/add-receipt-line-request.dto";
import { ReceiptTicketResponseDto } from "../dtos/receipt-ticket-response.dto";
import { ReceiptTicketLineResponseDto } from "../dtos/receipt-tickets/receipt-ticket-line-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Receipt Tickets")
@Controller("api/v1/receipt-tickets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReceiptTicketsController {
  constructor(
    private readonly createReceiptTicketUseCase: CreateReceiptTicketUseCase,
    private readonly addReceiptLineUseCase: AddReceiptLineUseCase,
    private readonly listReceiptTicketsUseCase: ListReceiptTicketsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permissions.RECEIPTS_VIEW)
  @ApiOperation({ summary: "List all Goods Receipts with filters" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a paginated list of Goods Receipts",
  })
  async findAll(@Query() query: GetReceiptTicketsDto) {
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
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { AddSplitTicketLinesUseCase } from "../../application/use-cases/split-tickets/add-split-ticket-lines.use-case";
import { ConfirmSplitTicketUseCase } from "../../application/use-cases/split-tickets/confirm-split-ticket.use-case";
import { VoidSplitTicketUseCase } from "../../application/use-cases/split-tickets/void-split-ticket.use-case";
import { CreateSplitTicketDto } from "../dtos/split-tickets/create-split-ticket.dto";
import { AddSplitTicketLinesDto } from "../dtos/split-tickets/add-split-ticket-lines.dto";
import { SplitTicketResponseDto } from "../dtos/split-tickets/split-ticket-response.dto";
import { VoidSplitTicketResponseDto } from "../dtos/split-tickets/void-split-ticket-response.dto";
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
    private readonly voidSplitTicketUseCase: VoidSplitTicketUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.STOCK_SPLIT)
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

  @Post(":id/lines")
  @RequirePermissions(Permissions.STOCK_SPLIT)
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

  @Post(":id/confirm")
  @RequirePermissions(Permissions.STOCK_SPLIT)
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

  @Post(":id/void")
  @RequirePermissions(Permissions.STOCK_SPLIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Void a confirmed split ticket to undo product breakdown",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Split ticket voided and stock movements reversed",
    type: VoidSplitTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid status (only confirmed can be voided)",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Split ticket not found",
  })
  async void(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<VoidSplitTicketResponseDto> {
    const { ticket, warnings } = await this.voidSplitTicketUseCase.execute(
      id,
      req.user.id,
    );
    return new VoidSplitTicketResponseDto(ticket, warnings);
  }
}

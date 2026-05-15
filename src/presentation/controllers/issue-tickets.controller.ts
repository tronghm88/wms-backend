import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/create-issue-ticket.use-case";
import { CompleteIssueTicketUseCase } from "../../application/use-cases/issue-tickets/complete-issue-ticket.use-case";
import { GetIssueTicketUseCase } from "../../application/use-cases/issue-tickets/get-issue-ticket.use-case";
import { CancelIssueTicketUseCase } from "../../application/use-cases/issue-tickets/cancel-issue-ticket.use-case";
import { DeleteIssueTicketUseCase } from "../../application/use-cases/issue-tickets/delete-issue-ticket.use-case";
import { UpdateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/update-issue-ticket.use-case";
import { AddIssueLineUseCase } from "../../application/use-cases/issue-tickets/add-issue-line.use-case";
import { DeleteIssueLineUseCase } from "../../application/use-cases/issue-tickets/delete-issue-line.use-case";
import { GetIssueTicketStatsUseCase } from "../../application/use-cases/issue-tickets/get-issue-ticket-stats.use-case";
import { ListIssueTicketsUseCase } from "../../application/use-cases/issue-tickets/list-issue-tickets.use-case";
import { CreateIssueTicketDto } from "../../application/dtos/create-issue-ticket.dto";
import { GetIssueTicketsDto } from "../dtos/issue-tickets/get-issue-tickets.dto";
import { IssueTicketResponseDto } from "../dtos/issue-tickets/issue-ticket-response.dto";
import { IssueTicketLineResponseDto } from "../dtos/issue-tickets/issue-ticket-line-response.dto";
import { CancelIssueTicketResponseDto } from "../dtos/issue-tickets/cancel-issue-ticket-response.dto";
import { UpdateIssueTicketRequestDto } from "../dtos/issue-tickets/update-issue-ticket-request.dto";
import { AddIssueLineRequestDto } from "../dtos/issue-tickets/add-issue-line-request.dto";
import { GetIssueStatsQueryDto } from "../dtos/issue-tickets/get-issue-stats-query.dto";
import { IssueStatsResponseDto } from "../dtos/issue-tickets/issue-stats-response.dto";
import { PaginatedIssueTicketResponseDto } from "../dtos/issue-tickets/paginated-issue-ticket-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard, RequirePermissions } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

@ApiTags("Issue Tickets")
@Controller("api/v1/issue-tickets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class IssueTicketsController {
  constructor(
    private readonly createIssueTicketUseCase: CreateIssueTicketUseCase,
    private readonly completeIssueTicketUseCase: CompleteIssueTicketUseCase,
    private readonly getIssueTicketUseCase: GetIssueTicketUseCase,
    private readonly cancelIssueTicketUseCase: CancelIssueTicketUseCase,
    private readonly deleteIssueTicketUseCase: DeleteIssueTicketUseCase,
    private readonly updateIssueTicketUseCase: UpdateIssueTicketUseCase,
    private readonly addIssueLineUseCase: AddIssueLineUseCase,
    private readonly deleteIssueLineUseCase: DeleteIssueLineUseCase,
    private readonly getIssueTicketStatsUseCase: GetIssueTicketStatsUseCase,
    private readonly listIssueTicketsUseCase: ListIssueTicketsUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permissions.ISSUES_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new Goods Issue Draft" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Goods Issue Draft successfully created",
    type: IssueTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Negative stock or invalid input",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" })
  async create(
    @Request()
    req: { user: { id: number; permissions: string[]; role: string } },
    @Body() dto: CreateIssueTicketDto,
  ): Promise<IssueTicketResponseDto> {
    const ticket = await this.createIssueTicketUseCase.execute(dto, req.user);
    return new IssueTicketResponseDto(ticket);
  }

  @Get()
  @RequirePermissions(Permissions.ISSUES_VIEW)
  @ApiOperation({ summary: "List all Goods Issues with filters" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns a paginated list of Goods Issues",
    type: PaginatedIssueTicketResponseDto,
  })
  async findAll(
    @Query() query: GetIssueTicketsDto,
  ): Promise<PaginatedIssueTicketResponseDto> {
    const result = await this.listIssueTicketsUseCase.execute({
      ...query,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
    return {
      data: result.data.map((ticket) => new IssueTicketResponseDto(ticket)),
      metadata: result.meta,
    };
  }

  @Get("stats")
  @RequirePermissions(Permissions.ISSUES_VIEW)
  @ApiOperation({ summary: "Get Issue Ticket statistics for a date range" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Returns Issue Ticket statistics",
    type: IssueStatsResponseDto,
  })
  async getStats(
    @Query() query: GetIssueStatsQueryDto,
  ): Promise<IssueStatsResponseDto> {
    const stats = await this.getIssueTicketStatsUseCase.execute(
      query.fromDate,
      query.toDate,
    );
    return new IssueStatsResponseDto(stats);
  }

  @Get(":id")
  @RequirePermissions(Permissions.ISSUES_VIEW)
  @ApiOperation({ summary: "Get Issue Ticket by ID" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket found",
    type: IssueTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket not found",
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<IssueTicketResponseDto> {
    const ticket = await this.getIssueTicketUseCase.execute(id);
    return new IssueTicketResponseDto(ticket);
  }

  @Patch(":id")
  @RequirePermissions(Permissions.ISSUES_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update basic information of a DRAFT Issue Ticket",
  })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket header updated successfully",
    type: IssueTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in DRAFT status",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateIssueTicketRequestDto,
  ): Promise<IssueTicketResponseDto> {
    const ticket = await this.updateIssueTicketUseCase.execute(id, {
      note: dto.note,
      date: dto.date ? new Date(dto.date) : undefined,
    });
    return new IssueTicketResponseDto(ticket);
  }

  @Delete(":id")
  @RequirePermissions(Permissions.ISSUES_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a DRAFT Issue Ticket" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket successfully deleted",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in DRAFT status",
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<null> {
    await this.deleteIssueTicketUseCase.execute(id);
    return null;
  }

  @Post(":id/lines")
  @RequirePermissions(Permissions.ISSUES_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a new line to a DRAFT Issue Ticket" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Line successfully added",
    type: IssueTicketLineResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket or Product not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in DRAFT status or insufficient stock",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "No permission to override price",
  })
  async addLine(
    @Param("id", ParseIntPipe) id: number,
    @Request()
    req: { user: { id: number; permissions: string[]; role: string } },
    @Body() dto: AddIssueLineRequestDto,
  ): Promise<IssueTicketLineResponseDto> {
    const line = await this.addIssueLineUseCase.execute(id, dto, req.user);
    return new IssueTicketLineResponseDto(line);
  }

  @Delete(":id/lines/:lineId")
  @RequirePermissions(Permissions.ISSUES_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a line from a DRAFT Issue Ticket" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiParam({ name: "lineId", type: Number, description: "Line ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Line successfully deleted",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket or line not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in DRAFT status",
  })
  async deleteLine(
    @Param("id", ParseIntPipe) id: number,
    @Param("lineId", ParseIntPipe) lineId: number,
  ): Promise<null> {
    await this.deleteIssueLineUseCase.execute(id, lineId);
    return null;
  }

  @Put(":id/confirm")
  @RequirePermissions(Permissions.ISSUES_CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm an Issue Ticket and update stock" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket successfully confirmed",
    type: IssueTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid status transition",
  })
  async confirm(
    @Request()
    req: { user: { id: number; permissions: string[]; role: string } },
    @Param("id", ParseIntPipe) id: number,
  ): Promise<IssueTicketResponseDto> {
    const ticket = await this.completeIssueTicketUseCase.execute(id, req.user);
    return new IssueTicketResponseDto(ticket);
  }

  @Post(":id/cancel")
  @RequirePermissions(Permissions.ISSUES_CANCEL)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a confirmed Issue Ticket and return stock" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket successfully cancelled",
    type: CancelIssueTicketResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Ticket not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ticket is not in CONFIRMED status",
  })
  async cancel(
    @Request()
    req: { user: { id: number; permissions: string[]; role: string } },
    @Param("id", ParseIntPipe) id: number,
  ): Promise<CancelIssueTicketResponseDto> {
    const { ticket, warnings } = await this.cancelIssueTicketUseCase.execute(
      id,
      req.user,
    );
    return new CancelIssueTicketResponseDto(ticket, warnings);
  }
}

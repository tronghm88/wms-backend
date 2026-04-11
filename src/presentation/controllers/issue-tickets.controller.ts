import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CreateIssueTicketDto } from "../../application/dtos/create-issue-ticket.dto";
import { IssueTicketResponseDto } from "../dtos/issue-tickets/issue-ticket-response.dto";
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

  @Patch(":id/complete")
  @RequirePermissions(Permissions.ISSUES_CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Complete an Issue Ticket and update stock" })
  @ApiParam({ name: "id", type: Number, description: "Issue Ticket ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Issue Ticket successfully completed",
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
  async complete(
    @Request()
    req: { user: { id: number; permissions: string[]; role: string } },
    @Param("id", ParseIntPipe) id: number,
  ): Promise<IssueTicketResponseDto> {
    const ticket = await this.completeIssueTicketUseCase.execute(id, req.user);
    return new IssueTicketResponseDto(ticket);
  }
}

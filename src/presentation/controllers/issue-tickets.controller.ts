import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import { CreateIssueTicketUseCase } from "../../application/use-cases/issue-tickets/create-issue-ticket.use-case";
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
}

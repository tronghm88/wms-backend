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
import { CreateSplitTicketUseCase } from "../../application/use-cases/split-tickets/create-split-ticket.use-case";
import { CreateSplitTicketDto } from "../dtos/split-tickets/create-split-ticket.dto";
import { SplitTicketResponseDto } from "../dtos/split-tickets/split-ticket-response.dto";
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
}

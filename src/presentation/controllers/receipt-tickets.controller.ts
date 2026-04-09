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
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { CreateReceiptTicketDto } from "../../application/dtos/create-receipt-ticket.dto";
import { ReceiptTicketResponseDto } from "../dtos/receipt-ticket-response.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@ApiTags("Receipt Tickets")
@Controller("api/v1/receipt-tickets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ReceiptTicketsController {
  constructor(
    private readonly createReceiptTicketUseCase: CreateReceiptTicketUseCase,
  ) {}

  @Post()
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
}

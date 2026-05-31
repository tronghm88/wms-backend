import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import { SplitTicketLineEntity } from "../../../domain/entities/split-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import { UpdateSplitLineRequestDto } from "../../../presentation/dtos/split-tickets/update-split-line-request.dto";

@Injectable()
export class UpdateSplitTicketLineUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    ticketId: number,
    lineId: number,
    dto: UpdateSplitLineRequestDto,
  ): Promise<SplitTicketLineEntity> {
    const ticket = await this.splitTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        "Only Pending (Draft) tickets can be modified",
      );
    }

    const line = await this.splitTicketRepository.findLineById(lineId);
    if (!line || line.ticketId !== ticketId) {
      throw new NotFoundException(
        `Line with ID ${lineId} not found in this ticket`,
      );
    }

    if (
      dto.targetProductId !== undefined &&
      dto.targetProductId !== line.targetProductId
    ) {
      const targetProduct = await this.productRepository.findById(
        dto.targetProductId,
      );
      if (!targetProduct) {
        throw new NotFoundException(
          `Target product with ID ${dto.targetProductId} not found`,
        );
      }
    }

    // Note: We no longer automatically calculate conversion between target and source products.
    // The user is responsible for ensuring the split logic makes sense outside the system.

    const updateData: Partial<SplitTicketLineEntity> = {};
    if (dto.targetProductId !== undefined)
      updateData.targetProductId = dto.targetProductId;
    if (dto.quantity !== undefined)
      updateData.quantity = new Decimal(dto.quantity);
    if (dto.unitCode !== undefined) updateData.unitCode = dto.unitCode;
    if (dto.isNewProduct !== undefined)
      updateData.isNewProduct = dto.isNewProduct;
    if (dto.note !== undefined) updateData.note = dto.note;

    return await this.splitTicketRepository.updateLine(lineId, updateData);
  }
}

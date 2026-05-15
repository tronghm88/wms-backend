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
import {
  UNIT_CONVERSION_REPOSITORY,
  type IUnitConversionRepository,
} from "../../../domain/contracts/unit-conversion.repository.interface";
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
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
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

    const proposedQuantity =
      dto.quantity !== undefined ? new Decimal(dto.quantity) : line.quantity;
    const proposedUnitCode = dto.unitCode ?? line.unitCode;

    // Calculate new total quantity to ensure it doesn't exceed sourceQty
    let totalQtyInSourceUnit = new Decimal(0);
    const lines = ticket.lines || [];

    for (const l of lines) {
      let lQty = l.quantity;
      let lUnitCode = l.unitCode;

      if (l.id === lineId) {
        lQty = proposedQuantity;
        lUnitCode = proposedUnitCode;
      }

      let qtyInSourceUnit = lQty;
      if (lUnitCode !== ticket.sourceUnitCode) {
        const conv1 = await this.unitConversionRepository.findByProductAndUnits(
          ticket.sourceProductId,
          ticket.sourceUnitCode,
          lUnitCode,
        );

        if (conv1) {
          qtyInSourceUnit = lQty.div(conv1.factor);
        } else {
          const conv2 =
            await this.unitConversionRepository.findByProductAndUnits(
              ticket.sourceProductId,
              lUnitCode,
              ticket.sourceUnitCode,
            );

          if (conv2) {
            qtyInSourceUnit = lQty.mul(conv2.factor);
          } else {
            throw new BadRequestException(
              `No unit conversion found between ${lUnitCode} and ${ticket.sourceUnitCode} for product ${ticket.sourceProductId}`,
            );
          }
        }
      }

      totalQtyInSourceUnit = totalQtyInSourceUnit.plus(qtyInSourceUnit);
    }

    if (totalQtyInSourceUnit.gt(ticket.sourceQty)) {
      throw new BadRequestException(
        `Total target quantity (${totalQtyInSourceUnit.toFixed(3)} ${ticket.sourceUnitCode}) exceeds source quantity (${ticket.sourceQty.toFixed(3)} ${ticket.sourceUnitCode})`,
      );
    }

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

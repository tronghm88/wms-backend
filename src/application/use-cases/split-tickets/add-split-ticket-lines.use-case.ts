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
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import { AddSplitTicketLinesDto } from "../../../presentation/dtos/split-tickets/add-split-ticket-lines.dto";

interface SplitTicketLineCreateInput {
  targetProductId: number;
  quantity: Decimal;
  unitCode: string;
  isNewProduct: boolean;
  note: string | null;
}

@Injectable()
export class AddSplitTicketLinesUseCase {
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
    dto: AddSplitTicketLinesDto,
  ): Promise<SplitTicketEntity> {
    // 1. Validate ticket existence and status
    const ticket = await this.splitTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException("Only Draft tickets can be modified");
    }

    // 2. Clear existing lines
    await this.splitTicketRepository.deleteLines(ticketId);

    let totalQtyInSourceUnit = new Decimal(0);

    // 3. Process each line
    const linesToCreate: SplitTicketLineCreateInput[] = [];
    const inputLines = dto.lines;

    for (const lineDto of inputLines) {
      // Validate target product
      const targetProduct = await this.productRepository.findById(
        lineDto.targetProductId,
      );
      if (!targetProduct) {
        throw new NotFoundException(
          `Target product with ID ${lineDto.targetProductId} not found`,
        );
      }

      const lineQty = new Decimal(lineDto.quantity);

      // Calculate quantity in source unit
      let qtyInSourceUnit = lineQty;
      if (lineDto.unitCode !== ticket.sourceUnitCode) {
        // Find conversion factor
        const conv1 = await this.unitConversionRepository.findByProductAndUnits(
          ticket.sourceProductId,
          ticket.sourceUnitCode,
          lineDto.unitCode,
        );

        if (conv1) {
          qtyInSourceUnit = lineQty.div(conv1.factor);
        } else {
          const conv2 =
            await this.unitConversionRepository.findByProductAndUnits(
              ticket.sourceProductId,
              lineDto.unitCode,
              ticket.sourceUnitCode,
            );

          if (conv2) {
            qtyInSourceUnit = lineQty.mul(conv2.factor);
          } else {
            throw new BadRequestException(
              `No unit conversion found between ${lineDto.unitCode} and ${ticket.sourceUnitCode} for product ${ticket.sourceProductId}`,
            );
          }
        }
      }

      totalQtyInSourceUnit = totalQtyInSourceUnit.plus(qtyInSourceUnit);

      linesToCreate.push({
        targetProductId: lineDto.targetProductId,
        quantity: lineQty,
        unitCode: lineDto.unitCode,
        isNewProduct: !!lineDto.isNewProduct,
        note: lineDto.note ?? null,
      });
    }

    // 4. Validate total quantity
    if (totalQtyInSourceUnit.gt(ticket.sourceQty.plus(0.0001))) {
      throw new BadRequestException(
        `Total target quantity (${totalQtyInSourceUnit.toFixed(3)} ${ticket.sourceUnitCode}) exceeds source quantity (${ticket.sourceQty.toFixed(3)} ${ticket.sourceUnitCode})`,
      );
    }

    // 5. Save lines
    await this.splitTicketRepository.addLines(ticketId, linesToCreate);

    // 6. Return updated ticket
    const updatedTicket = await this.splitTicketRepository.findById(ticketId);
    return updatedTicket!;
  }
}

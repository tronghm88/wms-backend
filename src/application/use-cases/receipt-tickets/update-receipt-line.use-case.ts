import { Inject, Injectable } from "@nestjs/common";
import {
  RECEIPT_TICKET_REPOSITORY,
  type IReceiptTicketRepository,
} from "../../../domain/contracts/receipt-ticket.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import {
  UNIT_CONVERSION_REPOSITORY,
  type IUnitConversionRepository,
} from "../../../domain/contracts/unit-conversion.repository.interface";
import {
  UNIT_REPOSITORY,
  type IUnitRepository,
} from "../../../domain/contracts/unit.repository.interface";
import { ReceiptTicketLineEntity } from "../../../domain/entities/receipt-ticket-line.entity";
import { TransactionStatus } from "../../../domain/enums";
import { UnitConversionEngine } from "../../../domain/services/unit-conversion-engine";
import {
  ReceiptTicketNotFoundException,
  ReceiptTicketNotDraftException,
  ReceiptTicketLineNotFoundException,
} from "../../../domain/exceptions/receipt-ticket.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { UpdateReceiptLineDto } from "../../dtos/update-receipt-line.dto";

@Injectable()
export class UpdateReceiptLineUseCase {
  constructor(
    @Inject(RECEIPT_TICKET_REPOSITORY)
    private readonly receiptTicketRepository: IReceiptTicketRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(
    ticketId: number,
    lineId: number,
    dto: UpdateReceiptLineDto,
    isAdmin: boolean,
    userId: number,
  ): Promise<ReceiptTicketLineEntity> {
    // 1. Check ticket
    const ticket = await this.receiptTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(ticketId);
    }

    // 2. Check draft status (unless admin)
    if (ticket.status !== TransactionStatus.DRAFT && !isAdmin) {
      throw new ReceiptTicketNotDraftException(ticketId);
    }

    // 3. Check line exists
    const existingLine =
      await this.receiptTicketRepository.findLineById(lineId);
    if (!existingLine || existingLine.ticketId !== ticketId) {
      throw new ReceiptTicketLineNotFoundException(lineId);
    }

    // 4. Update product, unit, quantity, length
    const productId = dto.productId ?? existingLine.productId;
    const unitCode = dto.unitCode ?? existingLine.unitCode;
    const quantity = dto.quantity ?? existingLine.quantity;
    let lengthM = existingLine.lengthM;
    const unitCost = dto.unitCost ?? existingLine.unitCost;

    // If product changed, we need its dimensions
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    // If product changed, use new product's length
    if (dto.productId) {
      lengthM = product.length;
    }

    // Check unit
    const unit = await this.unitRepository.findByCode(unitCode);
    if (!unit) {
      throw new UnitNotFoundException(unitCode);
    }

    // 5. Validate unit conversion to base unit
    if (unitCode !== product.baseUnit) {
      const conversions =
        await this.unitConversionRepository.findByProductId(productId);
      const baseQty = UnitConversionEngine.convertToUnit(
        quantity,
        unitCode,
        product.baseUnit,
        conversions,
      );
      if (baseQty === null) {
        throw new Error(
          `No unit conversion found from ${unitCode} to base unit ${product.baseUnit} for product ${product.code}`,
        );
      }
    }

    // 6. Update line
    const updatedLine = new ReceiptTicketLineEntity({
      ...existingLine,
      productId,
      quantity,
      unitCode,
      lengthM,
      areaM2: null,
      weightKg: null,
      unitCost,
      note: dto.note !== undefined ? dto.note : existingLine.note,
    });

    if (ticket.status === TransactionStatus.CONFIRMED && isAdmin) {
      return await this.receiptTicketRepository.updateLineWithStockAdjustment(
        lineId,
        updatedLine,
        existingLine,
        userId,
      );
    }

    return await this.receiptTicketRepository.updateLine(lineId, updatedLine);
  }
}

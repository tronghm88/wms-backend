import { Inject, Injectable } from "@nestjs/common";
import { Decimal } from "decimal.js";
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
    let lengthM = dto.lengthM ?? existingLine.lengthM;

    // If product changed, we need its dimensions
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    // If product changed and lengthM was not provided in DTO, use new product's length
    if (dto.productId && !dto.lengthM) {
      lengthM = product.length;
    }

    // Check unit
    const unit = await this.unitRepository.findByCode(unitCode);
    if (!unit) {
      throw new UnitNotFoundException(unitCode);
    }

    // 5. Re-calculate metrics using UnitConversionEngine
    let m2ToKgFactor: Decimal | undefined;
    const conversion =
      await this.unitConversionRepository.findByProductAndUnits(
        productId,
        "m2",
        "kg",
      );
    if (conversion) {
      m2ToKgFactor = conversion.factor;
    }

    const metrics = UnitConversionEngine.calculateReceiptLineMetrics({
      unitCode,
      quantity,
      lengthM,
      width: product.width,
      m2ToKgFactor,
    });

    // 6. Update line
    const updatedLine = new ReceiptTicketLineEntity({
      ...existingLine,
      productId,
      quantity,
      unitCode,
      lengthM,
      areaM2: metrics.areaM2,
      weightKg: metrics.weightKg,
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

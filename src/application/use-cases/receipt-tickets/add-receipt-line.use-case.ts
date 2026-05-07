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
} from "../../../domain/exceptions/receipt-ticket.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";
import { AddReceiptLineDto } from "../../dtos/add-receipt-line.dto";

@Injectable()
export class AddReceiptLineUseCase {
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
    dto: AddReceiptLineDto,
    isAdmin: boolean,
    userId: number,
  ): Promise<ReceiptTicketLineEntity> {
    // 1. Check ticket
    const ticket = await this.receiptTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new ReceiptTicketNotFoundException(ticketId);
    }
    if (ticket.status !== TransactionStatus.DRAFT && !isAdmin) {
      throw new ReceiptTicketNotDraftException(ticketId);
    }

    // 2. Check product
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new ProductNotFoundException(dto.productId);
    }

    // 3. Check unit
    const unit = await this.unitRepository.findByCode(dto.unitCode);
    if (!unit) {
      throw new UnitNotFoundException(dto.unitCode);
    }

    // 4. Validate unit conversion to base unit
    if (dto.unitCode !== product.baseUnit) {
      const conversions = await this.unitConversionRepository.findByProductId(
        dto.productId,
      );
      const baseQty = UnitConversionEngine.convertToUnit(
        dto.quantity,
        dto.unitCode,
        product.baseUnit,
        conversions,
      );
      if (baseQty === null) {
        throw new Error(
          `No unit conversion found from ${dto.unitCode} to base unit ${product.baseUnit} for product ${product.code}`,
        );
      }
    }

    // 5. Save line
    const line = new ReceiptTicketLineEntity({
      ticketId,
      productId: dto.productId,
      quantity: dto.quantity,
      unitCode: dto.unitCode,
      lengthM: dto.lengthM ?? product.length,
      areaM2: null,
      weightKg: null,
      note: dto.note,
    });

    if (ticket.status === TransactionStatus.CONFIRMED && isAdmin) {
      return await this.receiptTicketRepository.addLineWithStockAdjustment(
        line,
        userId,
      );
    }

    return await this.receiptTicketRepository.addLine(line);
  }
}

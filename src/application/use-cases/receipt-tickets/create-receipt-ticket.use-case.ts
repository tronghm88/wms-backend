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
import { ReceiptTicketEntity } from "../../../domain/entities/receipt-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { CreateReceiptTicketDto } from "../../dtos/create-receipt-ticket.dto";
import { UnitConversionEngine } from "../../../domain/services/unit-conversion-engine";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { UnitNotFoundException } from "../../../domain/exceptions/unit.exceptions";

@Injectable()
export class CreateReceiptTicketUseCase {
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
    dto: CreateReceiptTicketDto,
    userId: number,
  ): Promise<ReceiptTicketEntity> {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    const linesToPersist: Array<{
      productId: number;
      quantity: Decimal;
      unitCode: string;
      lengthM: Decimal | null;
      areaM2: Decimal | null;
      weightKg: Decimal | null;
      note: string | null;
    }> = [];

    if (dto.lines && dto.lines.length > 0) {
      for (const line of dto.lines) {
        const product = await this.productRepository.findById(line.productId);
        if (!product) {
          throw new ProductNotFoundException(line.productId);
        }

        const unit = await this.unitRepository.findByCode(line.unitCode);
        if (!unit) {
          throw new UnitNotFoundException(line.unitCode);
        }

        let m2ToKgFactor: Decimal | undefined;
        const conversion =
          await this.unitConversionRepository.findByProductAndUnits(
            line.productId,
            "m2",
            "kg",
          );
        if (conversion) {
          m2ToKgFactor = conversion.factor;
        }

        const metrics = UnitConversionEngine.calculateReceiptLineMetrics({
          unitCode: line.unitCode,
          quantity: line.quantity,
          lengthM: line.lengthM ?? product.length,
          width: product.width,
          m2ToKgFactor,
        });

        linesToPersist.push({
          productId: line.productId,
          quantity: line.quantity,
          unitCode: line.unitCode,
          lengthM: line.lengthM ?? product.length,
          areaM2: metrics.areaM2,
          weightKg: metrics.weightKg,
          note: line.note ?? null,
        });
      }
    }

    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (retryCount < MAX_RETRIES) {
      const lastTicketNo =
        await this.receiptTicketRepository.getLastTicketNo(yearMonth);

      let nextNumber = 1;
      if (lastTicketNo) {
        const parts = lastTicketNo.split("-");
        const lastN = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastN)) {
          nextNumber = lastN + 1;
        }
      }

      const ticketNo = `PN-${yearMonth}-${nextNumber}`;

      try {
        const ticket = new ReceiptTicketEntity({
          ticketNo,
          date: now,
          status: TransactionStatus.DRAFT,
          createdBy: userId,
          note: dto.note,
          supplierName: dto.supplierName,
          invoiceNo: dto.invoiceNo,
          invoiceDate: dto.invoiceDate,
        });

        return await this.receiptTicketRepository.create(
          ticket,
          linesToPersist.length > 0 ? linesToPersist : undefined,
        );
      } catch (err: unknown) {
        // P2002 is Prisma error for unique constraint violation
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code === "P2002"
        ) {
          retryCount++;
          continue;
        }
        throw err;
      }
    }

    throw new Error(
      "Failed to generate a unique ticket number after max retries.",
    );
  }
}

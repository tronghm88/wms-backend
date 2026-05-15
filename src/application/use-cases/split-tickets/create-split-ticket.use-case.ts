import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import { AddSplitTicketLinesUseCase } from "./add-split-ticket-lines.use-case";
import { AddSplitTicketLinesDto } from "../../../presentation/dtos/split-tickets/add-split-ticket-lines.dto";

export interface CreateSplitTicketRequest {
  sourceProductId: number;
  warehouseId: number;
  sourceQty: number;
  sourceUnitCode: string;
  note?: string;
  lines?: {
    targetProductId: number;
    quantity: number;
    unitCode: string;
    isNewProduct?: boolean;
    note?: string;
  }[];
}

@Injectable()
export class CreateSplitTicketUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly addSplitTicketLinesUseCase: AddSplitTicketLinesUseCase,
  ) {}

  async execute(
    request: CreateSplitTicketRequest,
    userId: number,
  ): Promise<SplitTicketEntity> {
    // 1. Validate sourceProductId
    const product = await this.productRepository.findById(
      request.sourceProductId,
    );
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${request.sourceProductId} not found`,
      );
    }

    // Note: warehouseId is validated by class-validator in DTO,
    // but we don't have a Warehouse model to check against in Phase 1.

    // 2. Generate ticket number ST-yyyyMM-n
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (retryCount < MAX_RETRIES) {
      const lastTicketNo =
        await this.splitTicketRepository.getLastTicketNo(yearMonth);

      let nextNumber = 1;
      if (lastTicketNo) {
        const parts = lastTicketNo.split("-");
        const lastN = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastN)) {
          nextNumber = lastN + 1;
        }
      }

      const ticketNo = `ST-${yearMonth}-${nextNumber}`;

      try {
        const ticket = new SplitTicketEntity({
          ticketNo,
          date: now,
          status: TransactionStatus.DRAFT,
          createdBy: userId,
          sourceProductId: request.sourceProductId,
          sourceQty: new Decimal(request.sourceQty),
          sourceUnitCode: request.sourceUnitCode,
          note: request.note,
        });

        const createdTicket = await this.splitTicketRepository.create(ticket);

        if (request.lines && request.lines.length > 0) {
          return await this.addSplitTicketLinesUseCase.execute(
            createdTicket.id,
            { lines: request.lines } as unknown as AddSplitTicketLinesDto,
          );
        }

        return createdTicket;
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

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
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from "../../../domain/contracts/inventory.repository.interface";
import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
} from "../../../domain/contracts/stock-movement.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus, StockMovementType } from "../../../domain/enums";

@Injectable()
export class VoidSplitTicketUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    id: number,
    userId: number,
  ): Promise<{ ticket: SplitTicketEntity; warnings: string[] }> {
    // 1. Find ticket
    const ticket = await this.splitTicketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${id} not found`);
    }

    // 2. Validate status
    if (ticket.status !== TransactionStatus.CONFIRMED) {
      throw new BadRequestException("Only Confirmed tickets can be voided");
    }

    const warnings: string[] = [];

    // 3. Check for child stock consumption and generate warnings
    for (const line of ticket.lines || []) {
      const targetInv = await this.inventoryRepository.findByProductId(
        line.targetProductId,
      );
      if (!targetInv || targetInv.quantity.lt(line.quantity)) {
        warnings.push(
          `Child product ID ${line.targetProductId} stock has already been consumed. Current: ${targetInv?.quantity.toFixed(3) ?? "0.000"}, Reverting: ${line.quantity.toFixed(3)}`,
        );
      }
    }

    // --- REVERSE TRANSACTIONS ---

    // 4 & 5. Create StockMovement for source product (IN) - handles inventory update
    await this.stockMovementRepository.registerMovement({
      productId: ticket.sourceProductId,
      txType: StockMovementType.IN,
      referenceId: ticket.id,
      referenceType: "SplitTicket",
      deltaQty: ticket.sourceQty,
      unitCode: ticket.sourceUnitCode,
      performedBy: userId,
      note: `Void Split Ticket ${ticket.ticketNo}`,
    });

    // 6. Deduct from child stock and clear parent link
    for (const line of ticket.lines || []) {
      // a & b. Create StockMovement (OUT) - handles inventory update
      await this.stockMovementRepository.registerMovement({
        productId: line.targetProductId,
        txType: StockMovementType.OUT,
        referenceId: ticket.id,
        referenceType: "SplitTicket",
        deltaQty: line.quantity.negated(),
        unitCode: line.unitCode,
        performedBy: userId,
        note: `Void Split Ticket ${ticket.ticketNo}`,
      });

      // c. Clear parent link if it was newly created/linked
      if (line.isNewProduct) {
        await this.productRepository.update(line.targetProductId, {
          parentProductId: undefined,
        });
      }
    }

    // 7. Update ticket status to CANCELLED
    const voidedTicket = await this.splitTicketRepository.update(id, {
      status: TransactionStatus.CANCELLED,
    });

    return { ticket: voidedTicket, warnings };
  }
}

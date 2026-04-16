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
export class ConfirmSplitTicketUseCase {
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

  async execute(id: number, userId: number): Promise<SplitTicketEntity> {
    // 1. Find ticket
    const ticket = await this.splitTicketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Split Ticket with ID ${id} not found`);
    }

    // 2. Validate status
    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException("Only Draft tickets can be confirmed");
    }

    // 3. Ensure ticket has lines
    if (!ticket.lines || ticket.lines.length === 0) {
      throw new BadRequestException(
        "Split Ticket must have at least one line before confirmation",
      );
    }

    // 4. Validate source inventory exists and has enough quantity
    const sourceInventory = await this.inventoryRepository.findByProductId(
      ticket.sourceProductId,
    );
    if (!sourceInventory || sourceInventory.quantity.lt(ticket.sourceQty)) {
      throw new BadRequestException(
        `Insufficient stock for source product ${ticket.sourceProductId}. Available: ${sourceInventory?.quantity.toFixed(3) ?? 0}, Required: ${ticket.sourceQty.toFixed(3)}`,
      );
    }

    // --- EXECUTE TRANSACTIONS ---

    // 5. Deduct quantity from source stock
    const updatedSourceInv = await this.inventoryRepository.updateQuantity(
      ticket.sourceProductId,
      ticket.sourceQty.negated(),
      ticket.sourceUnitCode,
    );

    // 6. Create StockMovement for source product (SPLIT_OUT)
    await this.stockMovementRepository.create({
      productId: ticket.sourceProductId,
      txType: StockMovementType.SPLIT_OUT,
      referenceId: ticket.id,
      referenceType: "SplitTicket",
      deltaQty: ticket.sourceQty.negated(),
      qtyAfter: updatedSourceInv.quantity,
      performedBy: userId,
      note: `Split Ticket ${ticket.ticketNo} confirmation`,
    });

    // 7. Process child lines
    for (const line of ticket.lines) {
      // a. Link product to parent if it's new
      if (line.isNewProduct) {
        await this.productRepository.update(line.targetProductId, {
          parentProductId: ticket.sourceProductId,
        });
      }

      // b. Add quantity to target stock
      const updatedTargetInv = await this.inventoryRepository.updateQuantity(
        line.targetProductId,
        line.quantity,
        line.unitCode,
      );

      // c. Create StockMovement for target product (SPLIT_IN)
      await this.stockMovementRepository.create({
        productId: line.targetProductId,
        txType: StockMovementType.SPLIT_IN,
        referenceId: ticket.id,
        referenceType: "SplitTicket",
        deltaQty: line.quantity,
        qtyAfter: updatedTargetInv.quantity,
        performedBy: userId,
        note: `Split Ticket ${ticket.ticketNo} confirmation`,
      });
    }

    // 8. Update ticket status to CONFIRMED
    const confirmedTicket = await this.splitTicketRepository.update(id, {
      status: TransactionStatus.CONFIRMED,
    });

    return confirmedTicket;
  }
}

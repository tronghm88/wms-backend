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
import {
  UNIT_CONVERSION_REPOSITORY,
  type IUnitConversionRepository,
} from "../../../domain/contracts/unit-conversion.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus, StockMovementType } from "../../../domain/enums";
import { UnitConversionEngine } from "../../../domain/services/unit-conversion-engine";
import { Decimal } from "decimal.js";

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
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly unitConversionRepository: IUnitConversionRepository,
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

    // 4. Validate source inventory (converted to base unit)
    const sourceProduct = await this.productRepository.findById(
      ticket.sourceProductId,
    );
    if (!sourceProduct) {
      throw new NotFoundException(
        `Source product with ID ${ticket.sourceProductId} not found`,
      );
    }

    const sourceConversions =
      await this.unitConversionRepository.findByProductId(
        ticket.sourceProductId,
      );
    const sourceQtyBase = UnitConversionEngine.convertToUnit(
      ticket.sourceQty,
      ticket.sourceUnitCode,
      sourceProduct.baseUnit,
      sourceConversions,
    );

    if (sourceQtyBase === null) {
      throw new BadRequestException(
        `Cannot convert source quantity from ${ticket.sourceUnitCode} to base unit ${sourceProduct.baseUnit}`,
      );
    }

    const sourceInventory = await this.inventoryRepository.findByProductId(
      ticket.sourceProductId,
    );
    const availableQty = sourceInventory?.quantity ?? new Decimal(0);

    if (sourceQtyBase.gt(availableQty)) {
      throw new BadRequestException(
        `Insufficient stock for source product. Available: ${availableQty.toFixed(3)} ${sourceProduct.baseUnit}, Required: ${sourceQtyBase.toFixed(3)} ${sourceProduct.baseUnit}`,
      );
    }

    // --- EXECUTE TRANSACTIONS ---

    // 5 & 6. Create StockMovement for source product (SPLIT_OUT) - handles inventory update
    await this.stockMovementRepository.registerMovement({
      productId: ticket.sourceProductId,
      txType: StockMovementType.SPLIT_OUT,
      referenceId: ticket.id,
      referenceType: "SplitTicket",
      deltaQty: sourceQtyBase.negated(),
      unitCode: sourceProduct.baseUnit,
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

      // b. Validate target product and convert to base unit
      const targetProduct = await this.productRepository.findById(
        line.targetProductId,
      );
      if (!targetProduct) {
        throw new NotFoundException(
          `Target product with ID ${line.targetProductId} not found`,
        );
      }

      const targetConversions =
        await this.unitConversionRepository.findByProductId(
          line.targetProductId,
        );
      const lineQtyBase = UnitConversionEngine.convertToUnit(
        line.quantity,
        line.unitCode,
        targetProduct.baseUnit,
        targetConversions,
      );

      if (lineQtyBase === null) {
        throw new BadRequestException(
          `Cannot convert line quantity for product ${line.targetProductId} from ${line.unitCode} to base unit ${targetProduct.baseUnit}`,
        );
      }

      // c. Create StockMovement for target product (SPLIT_IN) - handles inventory update
      await this.stockMovementRepository.registerMovement({
        productId: line.targetProductId,
        txType: StockMovementType.SPLIT_IN,
        referenceId: ticket.id,
        referenceType: "SplitTicket",
        deltaQty: lineQtyBase,
        unitCode: targetProduct.baseUnit,
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

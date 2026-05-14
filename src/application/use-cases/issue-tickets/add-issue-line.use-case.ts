import { ForbiddenException, Inject, Injectable, Logger } from "@nestjs/common";
import { Decimal } from "decimal.js";
import {
  ISSUE_TICKET_REPOSITORY,
  type IIssueTicketRepository,
} from "../../../domain/contracts/issue-ticket.repository.interface";
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from "../../../domain/contracts/product.repository.interface";
import {
  CUSTOMER_REPOSITORY,
  type ICustomerRepository,
} from "../../../domain/contracts/customer.repository.interface";
import {
  DISCOUNT_POLICY_REPOSITORY,
  type IDiscountPolicyRepository,
} from "../../../domain/contracts/discount-policy.repository.interface";
import {
  INVENTORY_REPOSITORY,
  type IInventoryRepository,
} from "../../../domain/contracts/inventory.repository.interface";
import { IssueTicketLineEntity } from "../../../domain/entities/issue-ticket-line.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import { PricingEngineService } from "../../../domain/services/pricing-engine.service";
import {
  IssueTicketNotFoundException,
  IssueTicketNotDraftException,
} from "../../../domain/exceptions/issue-ticket.exceptions";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { NegativeStockException } from "../../../domain/exceptions/inventory.exceptions";
import { Permissions } from "../../../domain/constants/permissions.constant";
import { AddIssueLineDto } from "../../dtos/add-issue-line.dto";

@Injectable()
export class AddIssueLineUseCase {
  private readonly logger = new Logger(AddIssueLineUseCase.name);

  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    ticketId: number,
    dto: AddIssueLineDto,
    user: { id: number; permissions: string[]; role: string },
  ): Promise<IssueTicketLineEntity> {
    const ticket = await this.issueTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new IssueTicketNotFoundException(ticketId);
    }

    if (ticket.status !== IssueTicketStatus.DRAFT) {
      throw new IssueTicketNotDraftException(ticketId);
    }

    const customer = await this.customerRepository.findById(ticket.customerId);
    if (!customer) {
      throw new CustomerNotFoundException(ticket.customerId);
    }

    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new ProductNotFoundException(dto.productId);
    }

    const inv = await this.inventoryRepository.findByProductId(dto.productId);
    const available = inv ? inv.quantity : new Decimal(0);
    const requestedQty = new Decimal(dto.quantity);

    if (available.lt(requestedQty)) {
      throw new NegativeStockException(
        dto.productId,
        requestedQty.toNumber(),
        available.toNumber(),
      );
    }

    const discountPolicies =
      await this.discountPolicyRepository.findByCustomerId(ticket.customerId);

    const pricing = PricingEngineService.calculateFinalPrice({
      customerId: ticket.customerId,
      productId: dto.productId,
      basePrice: product.basePrice,
      policies: discountPolicies,
    });

    let finalPrice = pricing.finalPrice;
    let isOverride = false;
    let originalPrice: Decimal | undefined = undefined;

    if (dto.manualPrice !== undefined) {
      const hasOverridePermission =
        user.role === "SUPER_ADMIN" ||
        user.role === "ADMIN" ||
        user.permissions.includes(Permissions.ISSUES_PRICE_OVERRIDE);

      if (!hasOverridePermission) {
        throw new ForbiddenException(
          "You do not have permission to override prices.",
        );
      }

      originalPrice = pricing.finalPrice;
      finalPrice = new Decimal(dto.manualPrice);
      isOverride = true;

      this.logger.log(
        `Price override by user ${user.id} for product ${dto.productId}: ` +
          `Original: ${originalPrice.toString()}, New: ${finalPrice.toString()}`,
      );
    }

    const lineTotal = finalPrice.mul(requestedQty).toDecimalPlaces(3);
    const newTotalAmount = ticket.totalAmount.plus(lineTotal);

    const lineData: Omit<
      IssueTicketLineEntity,
      "id" | "ticketId" | "createdAt" | "updatedAt"
    > = {
      productId: dto.productId,
      quantity: requestedQty,
      unitCode: dto.unitCode,
      basePrice: pricing.basePrice,
      discountType: pricing.appliedDiscountType,
      discountValue: pricing.appliedDiscountValue,
      finalPrice,
      lineTotal,
      originalPrice,
      isOverride,
      note: dto.note ?? null,
    };

    return await this.issueTicketRepository.addLine(
      ticketId,
      lineData,
      newTotalAmount,
    );
  }
}

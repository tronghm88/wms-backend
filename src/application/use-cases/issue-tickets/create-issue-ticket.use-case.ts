import { Inject, Injectable, Logger, ForbiddenException } from "@nestjs/common";
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
import { IssueTicketEntity } from "../../../domain/entities/issue-ticket.entity";
import { IssueTicketLineEntity } from "../../../domain/entities/issue-ticket-line.entity";
import { IssueTicketStatus } from "../../../domain/enums";
import { IssueTicketCodeGenerator } from "../../../domain/services/issue-ticket-code-generator.service";
import { PricingEngineService } from "../../../domain/services/pricing-engine.service";
import { CreateIssueTicketDto } from "../../dtos/create-issue-ticket.dto";
import { Decimal } from "decimal.js";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { NegativeStockException } from "../../../domain/exceptions/inventory.exceptions";
import { Permissions } from "../../../domain/constants/permissions.constant";

@Injectable()
export class CreateIssueTicketUseCase {
  private readonly logger = new Logger(CreateIssueTicketUseCase.name);

  constructor(
    @Inject(ISSUE_TICKET_REPOSITORY)
    private readonly issueTicketRepository: IIssueTicketRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    dto: CreateIssueTicketDto,
    user: { id: number; permissions: string[]; role: string },
  ): Promise<IssueTicketEntity> {
    const now = new Date();

    // 1. Validate Customer
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new CustomerNotFoundException(dto.customerId);
    }

    // 2. Fetch all products and inventory records in the lines
    const productIds = Array.from(new Set(dto.lines.map((l) => l.productId)));
    const [products, discountPolicies] = await Promise.all([
      this.productRepository.findByIds(productIds),
      this.discountPolicyRepository.findByCustomerId(dto.customerId),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Validate all products exist
    for (const productId of productIds) {
      if (!productMap.has(productId)) {
        throw new ProductNotFoundException(productId);
      }
    }

    // 4. Group line quantities by productId to check for negative stock
    const aggregatedQuantities = new Map<number, Decimal>();
    for (const line of dto.lines) {
      const current =
        aggregatedQuantities.get(line.productId) || new Decimal(0);
      aggregatedQuantities.set(line.productId, current.plus(line.quantity));
    }

    // 5. Fetch and Validate inventory sufficiency
    // We do this one by one or in parallel for products.
    // Given the small number of lines typical for a ticket, parallel should be fine.
    const inventoryList = await Promise.all(
      productIds.map((pid) => this.inventoryRepository.findByProductId(pid)),
    );
    const inventoryMap = new Map(
      inventoryList
        .filter((inv) => inv !== null)
        .map((inv) => [inv.productId, inv]),
    );

    for (const [productId, quantity] of aggregatedQuantities.entries()) {
      const inv = inventoryMap.get(productId);
      const available = inv ? inv.quantity : new Decimal(0);

      if (available.lt(quantity)) {
        throw new NegativeStockException(
          productId,
          quantity.toNumber(),
          available.toNumber(),
        );
      }
    }

    // 6. Calculate Pricing and build line entities
    let totalAmount = new Decimal(0);
    const lineEntities: IssueTicketLineEntity[] = [];

    for (const line of dto.lines) {
      const product = productMap.get(line.productId)!;

      // Intelligent Pricing application
      const pricing = PricingEngineService.calculateFinalPrice({
        customerId: dto.customerId,
        productId: line.productId,
        basePrice: product.basePrice,
        policies: discountPolicies,
      });

      let finalPrice = pricing.finalPrice;
      let isOverride = false;
      let originalPrice: Decimal | undefined = undefined;

      if (line.manualPrice !== undefined) {
        // Check Permissions
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
        finalPrice = new Decimal(line.manualPrice);
        isOverride = true;

        this.logger.log(
          `Price override by user ${user.id} for product ${line.productId}: ` +
            `Original: ${originalPrice.toString()}, New: ${finalPrice.toString()}`,
        );
      }

      const lineTotal = finalPrice.mul(line.quantity).toDecimalPlaces(3);
      totalAmount = totalAmount.plus(lineTotal);

      lineEntities.push(
        new IssueTicketLineEntity({
          productId: line.productId,
          quantity: new Decimal(line.quantity),
          unitCode: line.unitCode,
          basePrice: pricing.basePrice,
          discountType: pricing.appliedDiscountType,
          discountValue: pricing.appliedDiscountValue,
          finalPrice: finalPrice,
          lineTotal: lineTotal,
          originalPrice: originalPrice,
          isOverride: isOverride,
        }),
      );
    }

    // 7. Generate Ticket Code and Create Ticket
    let retryCount = 0;
    const MAX_RETRIES = 5;

    while (retryCount < MAX_RETRIES) {
      const code = await IssueTicketCodeGenerator.generateNextCode(
        this.issueTicketRepository,
        now,
      );

      try {
        const ticket = new IssueTicketEntity({
          code,
          date: now,
          customerId: dto.customerId,
          status: IssueTicketStatus.DRAFT,
          createdBy: user.id,
          totalAmount: totalAmount,
          note: dto.note,
          lines: lineEntities,
        });

        return await this.issueTicketRepository.create(ticket);
      } catch (err: unknown) {
        // P2002 is Prisma error for unique constraint violation on 'code'
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
      "Failed to generate a unique export ticket code after max retries.",
    );
  }
}

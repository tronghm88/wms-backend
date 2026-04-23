/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { CreateIssueTicketUseCase } from "../../../../src/application/use-cases/issue-tickets/create-issue-ticket.use-case";
import { IssueTicketStatus, DiscountType } from "../../../../src/domain/enums";
import { Decimal } from "decimal.js";
import { CustomerNotFoundException } from "../../../../src/domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../../src/domain/exceptions/product.exceptions";
import { NegativeStockException } from "../../../../src/domain/exceptions/inventory.exceptions";
import { IIssueTicketRepository } from "../../../../src/domain/contracts/issue-ticket.repository.interface";
import { ICustomerRepository } from "../../../../src/domain/contracts/customer.repository.interface";
import { IProductRepository } from "../../../../src/domain/contracts/product.repository.interface";
import { IDiscountPolicyRepository } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import { IInventoryRepository } from "../../../../src/domain/contracts/inventory.repository.interface";

describe("CreateIssueTicketUseCase", () => {
  let useCase: CreateIssueTicketUseCase;
  let mockIssueTicketRepo: jest.Mocked<IIssueTicketRepository>;
  let mockCustomerRepo: jest.Mocked<ICustomerRepository>;
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockDiscountPolicyRepo: jest.Mocked<IDiscountPolicyRepository>;
  let mockInventoryRepo: jest.Mocked<IInventoryRepository>;

  beforeEach(() => {
    mockIssueTicketRepo = {
      create: jest
        .fn()
        .mockImplementation((t) => Promise.resolve({ ...t, id: 1 })),
      getLastCode: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<IIssueTicketRepository>;
    mockCustomerRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;
    mockProductRepo = {
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;
    mockDiscountPolicyRepo = {
      findByCustomerId: jest.fn(),
    } as unknown as jest.Mocked<IDiscountPolicyRepository>;
    mockInventoryRepo = {
      findByProductId: jest.fn(),
    } as unknown as jest.Mocked<IInventoryRepository>;

    useCase = new CreateIssueTicketUseCase(
      mockIssueTicketRepo,
      mockCustomerRepo,
      mockProductRepo,
      mockDiscountPolicyRepo,
      mockInventoryRepo,
    );
  });

  it("should create a draft issue ticket with automatic pricing and sufficient stock", async () => {
    const user = { id: 1, role: "STAFF", permissions: [] };
    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m" }],
      note: "Test note",
    };

    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([
      {
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(10),
        isAppliedAll: true,
        productIds: [],
      } as any,
    ]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(20),
    } as any);

    const result = await useCase.execute(dto, user);

    expect(result.customerId).toBe(1);
    expect(result.status).toBe(IssueTicketStatus.DRAFT);
    expect(result.totalAmount.toString()).toBe("900"); // (100 * 0.9) * 10
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].finalPrice.toString()).toBe("90");
    expect(result.lines[0].lineTotal.toString()).toBe("900");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockIssueTicketRepo.create).toHaveBeenCalled();
  });

  it("should allow price override if user is Admin", async () => {
    const user = { id: 1, role: "ADMIN", permissions: [] };
    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m", manualPrice: 85.5 }],
    };

    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(20),
    } as any);

    const result = await useCase.execute(dto, user);

    expect(result.lines[0].finalPrice.toString()).toBe("85.5");
    expect(result.lines[0].isOverride).toBe(true);
    expect(result.lines[0].originalPrice?.toString()).toBe("100");
    expect(result.totalAmount.toString()).toBe("855");
  });

  it("should throw ForbiddenException if staff tries to override without permission", async () => {
    const user = { id: 1, role: "STAFF", permissions: [] };
    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m", manualPrice: 85.5 }],
    };

    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(20),
    } as any);

    await expect(useCase.execute(dto, user)).rejects.toThrow(
      "You do not have permission to override prices.",
    );
  });

  it("should allow price override if staff has ISSUES_PRICE_OVERRIDE permission", async () => {
    const user = {
      id: 1,
      role: "STAFF",
      permissions: ["issues:price-override"],
    };
    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m", manualPrice: 85.5 }],
    };

    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(20),
    } as any);

    const result = await useCase.execute(dto, user);

    expect(result.lines[0].finalPrice.toString()).toBe("85.5");
    expect(result.lines[0].isOverride).toBe(true);
  });

  it("should throw CustomerNotFoundException if customer does not exist", async () => {
    mockCustomerRepo.findById.mockResolvedValue(null);
    const user = { id: 1, role: "STAFF", permissions: [] };

    await expect(
      useCase.execute({ customerId: 999, lines: [] }, user),
    ).rejects.toThrow(CustomerNotFoundException);
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([]);
    const user = { id: 1, role: "STAFF", permissions: [] };

    const dto = {
      customerId: 1,
      lines: [{ productId: 999, quantity: 1, unitCode: "m" }],
    };

    await expect(useCase.execute(dto, user)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it("should throw NegativeStockException if stock is insufficient", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(5),
    } as any);

    const user = { id: 1, role: "STAFF", permissions: [] };
    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m" }],
    };

    await expect(useCase.execute(dto, user)).rejects.toThrow(
      NegativeStockException,
    );
  });

  it("should sum up multiple lines of the same product for stock validation", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" } as any,
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(15),
    } as any);

    const user = { id: 1, role: "STAFF", permissions: [] };
    const dto = {
      customerId: 1,
      lines: [
        { productId: 1, quantity: 10, unitCode: "m" },
        { productId: 1, quantity: 10, unitCode: "m" },
      ],
    };

    await expect(useCase.execute(dto, user)).rejects.toThrow(
      NegativeStockException,
    );
  });
});

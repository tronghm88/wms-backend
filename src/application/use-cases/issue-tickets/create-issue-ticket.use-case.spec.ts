import { CreateIssueTicketUseCase } from "./create-issue-ticket.use-case";
import { IssueTicketStatus, DiscountType } from "../../../domain/enums";
import { Decimal } from "decimal.js";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { NegativeStockException } from "../../../domain/exceptions/inventory.exceptions";

describe("CreateIssueTicketUseCase", () => {
  let useCase: CreateIssueTicketUseCase;
  let mockIssueTicketRepo: any;
  let mockCustomerRepo: any;
  let mockProductRepo: any;
  let mockDiscountPolicyRepo: any;
  let mockInventoryRepo: any;

  beforeEach(() => {
    mockIssueTicketRepo = {
      create: jest.fn().mockImplementation((t) => Promise.resolve({ ...t, id: 1 })),
      getLastCode: jest.fn().mockResolvedValue(null),
    };
    mockCustomerRepo = {
      findById: jest.fn(),
    };
    mockProductRepo = {
      findByIds: jest.fn(),
    };
    mockDiscountPolicyRepo = {
      findByCustomerId: jest.fn(),
    };
    mockInventoryRepo = {
      findByProductId: jest.fn(),
    };

    useCase = new CreateIssueTicketUseCase(
      mockIssueTicketRepo,
      mockCustomerRepo,
      mockProductRepo,
      mockDiscountPolicyRepo,
      mockInventoryRepo,
    );
  });

  it("should create a draft issue ticket with automatic pricing and sufficient stock", async () => {
    const userId = 1;
    const dto = {
      customerId: 1,
      lines: [
        { productId: 1, quantity: 10, unitCode: "m" },
      ],
      note: "Test note",
    };

    mockCustomerRepo.findById.mockResolvedValue({ id: 1 });
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" },
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([
      {
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        discountValue: new Decimal(10),
        isAppliedAll: true,
        productIds: [],
      },
    ]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(20),
    });

    const result = await useCase.execute(dto, userId);

    expect(result.customerId).toBe(1);
    expect(result.status).toBe(IssueTicketStatus.DRAFT);
    expect(result.totalAmount.toString()).toBe("900"); // (100 * 0.9) * 10
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].finalPrice.toString()).toBe("90");
    expect(result.lines[0].lineTotal.toString()).toBe("900");
    expect(mockIssueTicketRepo.create).toHaveBeenCalled();
  });

  it("should throw CustomerNotFoundException if customer does not exist", async () => {
    mockCustomerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ customerId: 999, lines: [] }, 1)).rejects.toThrow(
      CustomerNotFoundException,
    );
  });

  it("should throw ProductNotFoundException if product does not exist", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 });
    mockProductRepo.findByIds.mockResolvedValue([]);

    const dto = {
      customerId: 1,
      lines: [{ productId: 999, quantity: 1, unitCode: "m" }],
    };

    await expect(useCase.execute(dto, 1)).rejects.toThrow(ProductNotFoundException);
  });

  it("should throw NegativeStockException if stock is insufficient", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 });
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" },
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(5),
    });

    const dto = {
      customerId: 1,
      lines: [{ productId: 1, quantity: 10, unitCode: "m" }],
    };

    await expect(useCase.execute(dto, 1)).rejects.toThrow(NegativeStockException);
  });

  it("should sum up multiple lines of the same product for stock validation", async () => {
    mockCustomerRepo.findById.mockResolvedValue({ id: 1 });
    mockProductRepo.findByIds.mockResolvedValue([
      { id: 1, basePrice: new Decimal(100), baseUnit: "m" },
    ]);
    mockDiscountPolicyRepo.findByCustomerId.mockResolvedValue([]);
    mockInventoryRepo.findByProductId.mockResolvedValue({
      productId: 1,
      quantity: new Decimal(15),
    });

    const dto = {
      customerId: 1,
      lines: [
        { productId: 1, quantity: 10, unitCode: "m" },
        { productId: 1, quantity: 10, unitCode: "m" },
      ],
    };

    await expect(useCase.execute(dto, 1)).rejects.toThrow(NegativeStockException);
  });
});

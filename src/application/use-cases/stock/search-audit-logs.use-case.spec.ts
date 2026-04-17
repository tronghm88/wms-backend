/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { SearchAuditLogsUseCase } from "./search-audit-logs.use-case";
import {
  STOCK_MOVEMENT_REPOSITORY,
  IStockMovementRepository,
  AuditLogItem,
} from "../../../domain/contracts/stock-movement.repository.interface";
import { Decimal } from "decimal.js";
import { StockMovementType } from "../../../domain/enums";

describe("SearchAuditLogsUseCase", () => {
  let useCase: SearchAuditLogsUseCase;
  let repository: jest.Mocked<IStockMovementRepository>;

  const mockLogItem: AuditLogItem = {
    id: 1,
    productId: 1,
    productCode: "PROD-001",
    productName: "Test Product",
    categoryId: 1,
    categoryName: "Test Category",
    txType: StockMovementType.IN,
    referenceId: 1,
    referenceType: "RECEIPT_TICKET",
    ticketNo: "PN-0001",
    deltaQty: new Decimal("10.000"),
    qtyAfter: new Decimal("100.000"),
    performedBy: 1,
    performerName: "Admin User",
    note: "Initial stock",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      search: jest.fn().mockResolvedValue([mockLogItem]),
      findById: jest.fn(),
      findByProductId: jest.fn(),
      findByReference: jest.fn(),
      create: jest.fn(),
      registerMovement: jest.fn(),
    } as unknown as jest.Mocked<IStockMovementRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchAuditLogsUseCase,
        {
          provide: STOCK_MOVEMENT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<SearchAuditLogsUseCase>(SearchAuditLogsUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a list of audit logs with formatted decimals", async () => {
    const result = await useCase.execute({
      startDate: "2026-04-01T00:00:00Z",
    });

    expect(repository.search).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date("2026-04-01T00:00:00Z"),
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: mockLogItem.id,
      productId: mockLogItem.productId,
      productCode: mockLogItem.productCode,
      productName: mockLogItem.productName,
      categoryId: mockLogItem.categoryId,
      categoryName: mockLogItem.categoryName,
      txType: mockLogItem.txType,
      referenceId: mockLogItem.referenceId,
      referenceType: mockLogItem.referenceType,
      ticketNo: mockLogItem.ticketNo,
      deltaQty: "10.000",
      qtyAfter: "100.000",
      performedBy: mockLogItem.performedBy,
      performerName: mockLogItem.performerName,
      note: mockLogItem.note,
      createdAt: mockLogItem.createdAt,
    });
  });
});

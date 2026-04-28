/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { GetInventorySnapshotUseCase } from "../../../../src/application/use-cases/inventory/get-inventory-snapshot.use-case";
import {
  INVENTORY_REPOSITORY,
  IInventoryRepository,
  InventorySnapshotItem,
} from "../../../../src/domain/contracts/inventory.repository.interface";
import { Decimal } from "decimal.js";

describe("GetInventorySnapshotUseCase", () => {
  let useCase: GetInventorySnapshotUseCase;
  let repository: jest.Mocked<IInventoryRepository>;

  const mockSnapshotItem: InventorySnapshotItem = {
    productId: 1,
    productCode: "PROD-001",
    productName: "Test Product",
    categoryName: "Test Category",
    quantity: new Decimal("50.123"),
    unitCode: "kg",
    length: null,
    width: null,
    height: null,
    lastUpdated: new Date(),
  };

  beforeEach(async () => {
    repository = {
      findAllActiveStock: jest.fn().mockResolvedValue([mockSnapshotItem]),
      findByProductId: jest.fn(),
      findAll: jest.fn(),
      updateQuantity: jest.fn(),
    } as unknown as jest.Mocked<IInventoryRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetInventorySnapshotUseCase,
        {
          provide: INVENTORY_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<GetInventorySnapshotUseCase>(
      GetInventorySnapshotUseCase,
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a list of inventory items with formatted decimals", async () => {
    const result = await useCase.execute();

    expect(repository.findAllActiveStock).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      productId: mockSnapshotItem.productId,
      productCode: mockSnapshotItem.productCode,
      productName: mockSnapshotItem.productName,
      categoryName: mockSnapshotItem.categoryName,
      quantity: "50.123",
      unitCode: mockSnapshotItem.unitCode,
      length: null,
      width: null,
      height: null,
      lastUpdated: mockSnapshotItem.lastUpdated,
    });
  });
});

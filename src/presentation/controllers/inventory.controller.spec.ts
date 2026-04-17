/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { InventoryController } from "./inventory.controller";
import { GetInventorySnapshotUseCase } from "../../application/use-cases/inventory/get-inventory-snapshot.use-case";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { Permissions } from "../../domain/constants/permissions.constant";

describe("InventoryController", () => {
  let controller: InventoryController;
  let getInventorySnapshotUseCase: GetInventorySnapshotUseCase;

  const mockGetInventorySnapshotUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: GetInventorySnapshotUseCase,
          useValue: mockGetInventorySnapshotUseCase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InventoryController>(InventoryController);
    getInventorySnapshotUseCase = module.get<GetInventorySnapshotUseCase>(
      GetInventorySnapshotUseCase,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getSnapshot", () => {
    it("should return an inventory snapshot", async () => {
      const mockResult = [
        {
          productId: 1,
          productCode: "PROD-001",
          productName: "Product 1",
          categoryName: "Category 1",
          quantity: "10.000",
          unitCode: "m2",
          length: "1.000",
          width: "1.000",
          height: "0.100",
          weight: "5.000",
          lastUpdated: new Date(),
        },
      ];

      mockGetInventorySnapshotUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getSnapshot();

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
      expect(result[0].quantity).toBe("10.000");
      expect(getInventorySnapshotUseCase.execute).toHaveBeenCalled();
    });
  });
});

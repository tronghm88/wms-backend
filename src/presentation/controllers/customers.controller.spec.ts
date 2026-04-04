/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CustomersController } from "./customers.controller";
import { CreateCustomerUseCase } from "../../application/use-cases/customers/create-customer.use-case";
import { GetCustomersUseCase } from "../../application/use-cases/customers/get-customers.use-case";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";

describe("CustomersController", () => {
  let controller: CustomersController;
  let getCustomersUseCase: GetCustomersUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CreateCustomerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCustomersUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    getCustomersUseCase = module.get<GetCustomersUseCase>(GetCustomersUseCase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated customers", async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            code: "C001",
            name: "Customer 1",
            address: "Address 1",
            phone: "0123456789",
            email: "c1@example.com",
            note: "note",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
        },
      };
      jest
        .spyOn(getCustomersUseCase, "execute")
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .mockResolvedValue(mockResult as any);

      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(result).toEqual({
        statusCode: 200,
        data: mockResult,
      });
      expect(getCustomersUseCase.execute).toHaveBeenCalledWith(query);
    });
  });
});

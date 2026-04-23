import { Test, TestingModule } from "@nestjs/testing";
import { CUSTOMER_REPOSITORY } from "../../../../src/domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../../src/domain/contracts/customer.repository.interface";
import { GetCustomerUseCase } from "../../../../src/application/use-cases/customers/get-customer.use-case";
import { CustomerNotFoundException } from "../../../../src/domain/exceptions/customer.exceptions";
import { CustomerEntity } from "../../../../src/domain/entities/customer.entity";

describe("GetCustomerUseCase", () => {
  let useCase: GetCustomerUseCase;
  let mockCustomerRepository: jest.Mocked<Partial<ICustomerRepository>>;

  const mockCustomer = new CustomerEntity({
    id: 1,
    code: "CUST001",
    name: "John Doe",
    address: "123 Main St",
    phone: "1234567890",
    email: "john@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    mockCustomerRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomerUseCase>(GetCustomerUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return a customer if it exists", async () => {
    (mockCustomerRepository.findById as jest.Mock).mockResolvedValue(
      mockCustomer,
    );

    const result = await useCase.execute(1);

    expect(result).toEqual(mockCustomer);
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(1);
  });

  it("should throw CustomerNotFoundException if customer does not exist", async () => {
    (mockCustomerRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(CustomerNotFoundException);
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(1);
  });
});

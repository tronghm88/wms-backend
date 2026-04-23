import { Test, TestingModule } from "@nestjs/testing";
import { GetCustomersUseCase } from "../../../../src/application/use-cases/customers/get-customers.use-case";
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository,
} from "../../../../src/domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../../src/domain/entities/customer.entity";

describe("GetCustomersUseCase", () => {
  let useCase: GetCustomersUseCase;
  let mockCustomerRepository: jest.Mocked<Partial<ICustomerRepository>>;

  beforeEach(async () => {
    mockCustomerRepository = {
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomersUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomersUseCase>(GetCustomersUseCase);
  });

  it("should return customers and meta data correctly", async () => {
    const mockCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "Customer 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockCustomerRepository.findAndCount as jest.Mock).mockResolvedValue([
      [mockCustomer],
      1,
    ]);

    const result = await useCase.execute({
      page: 1,
      limit: 20,
    });

    expect(mockCustomerRepository.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      search: undefined,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].code).toBe("C001");
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      lastPage: 1,
    });
  });

  it("should search correctly", async () => {
    (mockCustomerRepository.findAndCount as jest.Mock).mockResolvedValue([
      [],
      0,
    ]);

    await useCase.execute({
      search: "test",
      page: 1,
      limit: 20,
    });

    expect(mockCustomerRepository.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      search: "test",
    });
  });
});

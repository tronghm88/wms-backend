/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateCustomerUseCase } from "../../../../src/application/use-cases/customers/update-customer.use-case";
import { CUSTOMER_REPOSITORY } from "../../../../src/domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../../src/domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../../src/domain/entities/customer.entity";
import { CustomerNotFoundException } from "../../../../src/domain/exceptions/customer.exceptions";

describe("UpdateCustomerUseCase", () => {
  let useCase: UpdateCustomerUseCase;
  let repository: jest.Mocked<ICustomerRepository>;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      countIssueTickets: jest.fn(),
      findLatestCodeByPrefix: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
  });

  it("should update a customer successfully", async () => {
    const existingCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "Old Name",
    });

    const updatedCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "New Name",
    });

    repository.findById.mockResolvedValue(existingCustomer);
    repository.update.mockResolvedValue(updatedCustomer);

    const result = await useCase.execute({
      id: 1,
      name: "New Name",
    });

    expect(result.name).toBe("New Name");
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.update).toHaveBeenCalled();
  });

  it("should throw CustomerNotFoundException if customer does not exist", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 999,
        name: "New Name",
      }),
    ).rejects.toThrow(CustomerNotFoundException);
  });

  it("should update customer name successfully", async () => {
    const existingCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "Old Name",
    });

    repository.findById.mockResolvedValue(existingCustomer);
    repository.update.mockResolvedValue(
      new CustomerEntity({ ...existingCustomer, name: "New Name" }),
    );

    await useCase.execute({
      id: 1,
      name: "New Name",
    });

    expect(repository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: "New Name" }),
    );
  });
});

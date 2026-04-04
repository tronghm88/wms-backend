/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { UpdateCustomerUseCase } from "./update-customer.use-case";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { CustomerEntity } from "../../../domain/entities/customer.entity";
import {
  CustomerCodeAlreadyExistsException,
  CustomerNotFoundException,
} from "../../../domain/exceptions/customer.exceptions";

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
      code: "C001-NEW",
      name: "New Name",
    });

    repository.findById.mockResolvedValue(existingCustomer);
    repository.findByCode.mockResolvedValue(null);
    repository.update.mockResolvedValue(updatedCustomer);

    const result = await useCase.execute({
      id: 1,
      code: "C001-NEW",
      name: "New Name",
    });

    expect(result.name).toBe("New Name");
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.findByCode).toHaveBeenCalledWith("C001-NEW");
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

  it("should throw CustomerCodeAlreadyExistsException if code is already taken", async () => {
    const existingCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "Old Name",
    });

    const anotherCustomer = new CustomerEntity({
      id: 2,
      code: "C002",
      name: "Another",
    });

    repository.findById.mockResolvedValue(existingCustomer);
    repository.findByCode.mockResolvedValue(anotherCustomer);

    await expect(
      useCase.execute({
        id: 1,
        code: "C002",
      }),
    ).rejects.toThrow(CustomerCodeAlreadyExistsException);
  });

  it("should not check code uniqueness if code is not changed", async () => {
    const existingCustomer = new CustomerEntity({
      id: 1,
      code: "C001",
      name: "Old Name",
    });

    repository.findById.mockResolvedValue(existingCustomer);
    repository.update.mockResolvedValue(existingCustomer);

    await useCase.execute({
      id: 1,
      code: "C001",
      name: "New Name",
    });

    expect(repository.findByCode).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: "New Name" }),
    );
  });
});

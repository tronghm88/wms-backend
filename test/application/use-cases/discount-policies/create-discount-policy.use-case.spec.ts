import {
  CreateDiscountPolicyUseCase,
  CreateDiscountPolicyDto,
} from "../../../../src/application/use-cases/discount-policies/create-discount-policy.use-case";
import { IDiscountPolicyRepository } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import { ICustomerRepository } from "../../../../src/domain/contracts/customer.repository.interface";
import { IProductRepository } from "../../../../src/domain/contracts/product.repository.interface";
import { DiscountType } from "../../../../src/domain/enums";
import {
  DuplicateGeneralDiscountPolicyException,
  InvalidDiscountPolicyConfigurationException,
  ProductAlreadyHasDiscountPolicyException,
} from "../../../../src/domain/exceptions/discount-policy.exceptions";
import { CustomerNotFoundException } from "../../../../src/domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../../src/domain/exceptions/product.exceptions";
import { DiscountPolicyEntity } from "../../../../src/domain/entities/discount-policy.entity";
import { Decimal } from "decimal.js";
import { CustomerEntity } from "../../../../src/domain/entities/customer.entity";
import { ProductEntity } from "../../../../src/domain/entities/product.entity";

describe("CreateDiscountPolicyUseCase", () => {
  let useCase: CreateDiscountPolicyUseCase;
  let discountPolicyRepository: jest.Mocked<IDiscountPolicyRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    discountPolicyRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAppliedAllByCustomerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IDiscountPolicyRepository>;

    customerRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    productRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    useCase = new CreateDiscountPolicyUseCase(
      discountPolicyRepository,
      customerRepository,
      productRepository,
    );
  });

  const dto: CreateDiscountPolicyDto = {
    customerId: 1,
    discountType: DiscountType.PERCENT,
    isAppliedAll: true,
    productIds: [],
    discountValue: "10.000",
  };

  it("should throw CustomerNotFoundException if customer does not exist", async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      CustomerNotFoundException,
    );
  });

  it("should throw InvalidDiscountPolicyConfigurationException if isAppliedAll is true and productIds is not empty", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    const invalidDto = { ...dto, isAppliedAll: true, productIds: [1] };

    await expect(useCase.execute(invalidDto)).rejects.toThrow(
      InvalidDiscountPolicyConfigurationException,
    );
  });

  it("should throw InvalidDiscountPolicyConfigurationException if isAppliedAll is false and productIds is empty", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    const invalidDto = { ...dto, isAppliedAll: false, productIds: [] };

    await expect(useCase.execute(invalidDto)).rejects.toThrow(
      InvalidDiscountPolicyConfigurationException,
    );
  });

  it("should throw DuplicateGeneralDiscountPolicyException if customer already has a general policy", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([
      new DiscountPolicyEntity({ isAppliedAll: true }),
    ]);

    await expect(useCase.execute(dto)).rejects.toThrow(
      DuplicateGeneralDiscountPolicyException,
    );
  });

  it("should successfully create a general discount policy even if specific ones exist", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([
      new DiscountPolicyEntity({
        id: 2,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: false,
        productIds: [1],
        discountValue: new Decimal("5.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
    discountPolicyRepository.create.mockResolvedValue(
      new DiscountPolicyEntity({
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: true,
        productIds: [],
        discountValue: new Decimal("10.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(dto);
    expect(result.discountValue).toBe("10.000");
  });

  it("should throw ProductNotFoundException if one of the products does not exist", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([]);
    productRepository.findById.mockResolvedValue(null);

    const specificDto = { ...dto, isAppliedAll: false, productIds: [99] };

    await expect(useCase.execute(specificDto)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it("should successfully create a specific product discount policy even if a general one exists", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([
      new DiscountPolicyEntity({
        id: 2,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: true,
        productIds: [],
        discountValue: new Decimal("5.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
    productRepository.findById.mockResolvedValue({
      id: 2,
    } as unknown as ProductEntity);
    discountPolicyRepository.create.mockResolvedValue(
      new DiscountPolicyEntity({
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: false,
        productIds: [2],
        discountValue: new Decimal("10.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const specificDto = { ...dto, isAppliedAll: false, productIds: [2] };
    const result = await useCase.execute(specificDto);
    expect(result.discountValue).toBe("10.000");
  });

  it("should throw ProductAlreadyHasDiscountPolicyException if a product already has a specific policy", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([
      new DiscountPolicyEntity({ isAppliedAll: false, productIds: [1] }),
    ]);
    productRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as ProductEntity);

    const specificDto = { ...dto, isAppliedAll: false, productIds: [1] };

    await expect(useCase.execute(specificDto)).rejects.toThrow(
      ProductAlreadyHasDiscountPolicyException,
    );
  });

  it("should successfully create a general discount policy", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([]);
    discountPolicyRepository.create.mockResolvedValue(
      new DiscountPolicyEntity({
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: true,
        productIds: [],
        discountValue: new Decimal("10.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(dto);

    expect(result.discountValue).toBe("10.000");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(discountPolicyRepository.create).toHaveBeenCalledWith({
      customerId: dto.customerId,
      discountType: dto.discountType,
      isAppliedAll: dto.isAppliedAll,
      productIds: dto.productIds,
      discountValue: new Decimal(dto.discountValue),
    });
  });

  it("should successfully create a specific product discount policy", async () => {
    customerRepository.findById.mockResolvedValue({
      id: 1,
    } as unknown as CustomerEntity);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([]);
    productRepository.findById.mockResolvedValue({
      id: 2,
    } as unknown as ProductEntity);
    discountPolicyRepository.create.mockResolvedValue(
      new DiscountPolicyEntity({
        id: 1,
        customerId: 1,
        discountType: DiscountType.PERCENT,
        isAppliedAll: false,
        productIds: [2],
        discountValue: new Decimal("10.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const specificDto = { ...dto, isAppliedAll: false, productIds: [2] };
    const result = await useCase.execute(specificDto);

    expect(result.discountValue).toBe("10.000");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(discountPolicyRepository.create).toHaveBeenCalledWith({
      customerId: specificDto.customerId,
      discountType: specificDto.discountType,
      isAppliedAll: specificDto.isAppliedAll,
      productIds: [2],
      discountValue: new Decimal(specificDto.discountValue),
    });
  });
});

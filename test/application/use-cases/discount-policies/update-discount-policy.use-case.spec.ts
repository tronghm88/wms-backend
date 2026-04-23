import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDiscountPolicyUseCase } from "../../../../src/application/use-cases/discount-policies/update-discount-policy.use-case";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../../src/domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../../src/domain/contracts/product.repository.interface";
import { DiscountType } from "../../../../src/domain/enums";
import {
  DiscountPolicyNotFoundException,
  DiscountPolicyUsedException,
  DuplicateGeneralDiscountPolicyException,
  InvalidDiscountPolicyConfigurationException,
} from "../../../../src/domain/exceptions/discount-policy.exceptions";
import { DiscountPolicyEntity } from "../../../../src/domain/entities/discount-policy.entity";
import { Decimal } from "decimal.js";

describe("UpdateDiscountPolicyUseCase", () => {
  let useCase: UpdateDiscountPolicyUseCase;
  let discountPolicyRepository: jest.Mocked<IDiscountPolicyRepository>;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    discountPolicyRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAppliedAllByCustomerId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IDiscountPolicyRepository>;

    productRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDiscountPolicyUseCase,
        {
          provide: DISCOUNT_POLICY_REPOSITORY,
          useValue: discountPolicyRepository,
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: productRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateDiscountPolicyUseCase>(
      UpdateDiscountPolicyUseCase,
    );
  });

  const existingPolicy = new DiscountPolicyEntity({
    id: 1,
    customerId: 1,
    discountType: DiscountType.PERCENT,
    isAppliedAll: true,
    productIds: [],
    discountValue: new Decimal("10.000"),
    isUsed: false,
  });

  it("should throw DiscountPolicyNotFoundException if policy does not exist", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      useCase.execute(1, {
        discountType: DiscountType.PERCENT,
        isAppliedAll: true,
        discountValue: "10",
      }),
    ).rejects.toThrow(DiscountPolicyNotFoundException);
  });

  it("should throw DiscountPolicyUsedException if policy is already used", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      new DiscountPolicyEntity({ ...existingPolicy, isUsed: true }),
    );
    await expect(
      useCase.execute(1, {
        discountType: DiscountType.PERCENT,
        isAppliedAll: true,
        discountValue: "10",
      }),
    ).rejects.toThrow(DiscountPolicyUsedException);
  });

  it("should throw InvalidDiscountPolicyConfigurationException if isAppliedAll is true and productIds is not empty", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      existingPolicy,
    );
    await expect(
      useCase.execute(1, {
        isAppliedAll: true,
        productIds: [1],
        discountType: DiscountType.PERCENT,
        discountValue: "10",
      }),
    ).rejects.toThrow(InvalidDiscountPolicyConfigurationException);
  });

  it("should throw DuplicateGeneralDiscountPolicyException if updating to general and another one exists", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      new DiscountPolicyEntity({
        ...existingPolicy,
        isAppliedAll: false,
        productIds: [1],
      }),
    );
    (discountPolicyRepository.findByCustomerId as jest.Mock).mockResolvedValue([
      new DiscountPolicyEntity({ id: 1, isAppliedAll: false, productIds: [1] }),
      new DiscountPolicyEntity({ id: 2, isAppliedAll: true, productIds: [] }),
    ]);

    await expect(
      useCase.execute(1, {
        isAppliedAll: true,
        productIds: [],
        discountType: DiscountType.PERCENT,
        discountValue: "10",
      }),
    ).rejects.toThrow(DuplicateGeneralDiscountPolicyException);
  });

  it("should successfully update a discount policy", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      existingPolicy,
    );
    (discountPolicyRepository.findByCustomerId as jest.Mock).mockResolvedValue([
      existingPolicy,
    ]);
    (discountPolicyRepository.update as jest.Mock).mockResolvedValue(
      new DiscountPolicyEntity({
        ...existingPolicy,
        discountValue: new Decimal("15.000"),
      }),
    );

    const result = await useCase.execute(1, {
      discountType: DiscountType.PERCENT,
      isAppliedAll: true,
      productIds: [],
      discountValue: "15.000",
    });

    expect(result.discountValue).toBe("15.000");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(discountPolicyRepository.update).toHaveBeenCalled();
  });
});

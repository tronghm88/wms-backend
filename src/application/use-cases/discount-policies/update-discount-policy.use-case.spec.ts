import { Test, TestingModule } from "@nestjs/testing";
import { UpdateDiscountPolicyUseCase } from "./update-discount-policy.use-case";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../domain/contracts/discount-policy.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import { DiscountType } from "../../../domain/enums";
import {
  DiscountPolicyNotFoundException,
  DiscountPolicyUsedException,
  DuplicateGeneralDiscountPolicyException,
  InvalidDiscountPolicyConfigurationException,
  ProductAlreadyHasDiscountPolicyException,
} from "../../../domain/exceptions/discount-policy.exceptions";
import { DiscountPolicyEntity } from "../../../domain/entities/discount-policy.entity";
import { Decimal } from "decimal.js";

describe("UpdateDiscountPolicyUseCase", () => {
  let useCase: UpdateDiscountPolicyUseCase;
  let discountPolicyRepository: any;
  let productRepository: any;

  beforeEach(async () => {
    discountPolicyRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      update: jest.fn(),
    };
    productRepository = {
      findById: jest.fn(),
    };

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

    useCase = module.get<UpdateDiscountPolicyUseCase>(UpdateDiscountPolicyUseCase);
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
    discountPolicyRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(1, {} as any)).rejects.toThrow(
      DiscountPolicyNotFoundException,
    );
  });

  it("should throw DiscountPolicyUsedException if policy is already used", async () => {
    discountPolicyRepository.findById.mockResolvedValue(
      new DiscountPolicyEntity({ ...existingPolicy, isUsed: true }),
    );
    await expect(useCase.execute(1, {} as any)).rejects.toThrow(
      DiscountPolicyUsedException,
    );
  });

  it("should throw InvalidDiscountPolicyConfigurationException if isAppliedAll is true and productIds is not empty", async () => {
    discountPolicyRepository.findById.mockResolvedValue(existingPolicy);
    await expect(
      useCase.execute(1, { isAppliedAll: true, productIds: [1] } as any),
    ).rejects.toThrow(InvalidDiscountPolicyConfigurationException);
  });

  it("should throw DuplicateGeneralDiscountPolicyException if updating to general and another one exists", async () => {
    discountPolicyRepository.findById.mockResolvedValue(
      new DiscountPolicyEntity({ ...existingPolicy, isAppliedAll: false, productIds: [1] }),
    );
    discountPolicyRepository.findByCustomerId.mockResolvedValue([
      new DiscountPolicyEntity({ id: 1, isAppliedAll: false, productIds: [1] }),
      new DiscountPolicyEntity({ id: 2, isAppliedAll: true, productIds: [] }),
    ]);

    await expect(
      useCase.execute(1, { isAppliedAll: true, productIds: [], discountType: DiscountType.PERCENT, discountValue: "10" }),
    ).rejects.toThrow(DuplicateGeneralDiscountPolicyException);
  });

  it("should successfully update a discount policy", async () => {
    discountPolicyRepository.findById.mockResolvedValue(existingPolicy);
    discountPolicyRepository.findByCustomerId.mockResolvedValue([existingPolicy]);
    discountPolicyRepository.update.mockResolvedValue(
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
    expect(discountPolicyRepository.update).toHaveBeenCalled();
  });
});

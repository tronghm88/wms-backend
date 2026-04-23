import { Test, TestingModule } from "@nestjs/testing";
import { DeleteDiscountPolicyUseCase } from "../../../../src/application/use-cases/discount-policies/delete-discount-policy.use-case";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../../src/domain/contracts/discount-policy.repository.interface";
import {
  DiscountPolicyNotFoundException,
  DiscountPolicyUsedException,
} from "../../../../src/domain/exceptions/discount-policy.exceptions";
import { DiscountPolicyEntity } from "../../../../src/domain/entities/discount-policy.entity";
import { DiscountType } from "../../../../src/domain/enums";
import { Decimal } from "decimal.js";

describe("DeleteDiscountPolicyUseCase", () => {
  let useCase: DeleteDiscountPolicyUseCase;
  let discountPolicyRepository: jest.Mocked<IDiscountPolicyRepository>;

  beforeEach(async () => {
    discountPolicyRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IDiscountPolicyRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteDiscountPolicyUseCase,
        {
          provide: DISCOUNT_POLICY_REPOSITORY,
          useValue: discountPolicyRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteDiscountPolicyUseCase>(
      DeleteDiscountPolicyUseCase,
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
    deletedAt: null,
  });

  it("should throw DiscountPolicyNotFoundException if policy does not exist", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toThrow(
      DiscountPolicyNotFoundException,
    );
  });

  it("should throw DiscountPolicyUsedException if policy is already used", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      new DiscountPolicyEntity({ ...existingPolicy, isUsed: true }),
    );
    await expect(useCase.execute(1)).rejects.toThrow(
      DiscountPolicyUsedException,
    );
  });

  it("should successfully soft delete a discount policy", async () => {
    (discountPolicyRepository.findById as jest.Mock).mockResolvedValue(
      existingPolicy,
    );
    (discountPolicyRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await useCase.execute(1);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(discountPolicyRepository.delete).toHaveBeenCalledWith(1);
  });
});

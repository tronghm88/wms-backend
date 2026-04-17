import { Inject, Injectable } from "@nestjs/common";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../domain/contracts/discount-policy.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { DiscountType } from "../../../domain/enums";
import {
  DiscountPolicyNotFoundException,
  DiscountPolicyUsedException,
  DuplicateGeneralDiscountPolicyException,
  InvalidDiscountPolicyConfigurationException,
  ProductAlreadyHasDiscountPolicyException,
} from "../../../domain/exceptions/discount-policy.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { Decimal } from "decimal.js";

export interface UpdateDiscountPolicyDto {
  discountType: DiscountType;
  isAppliedAll: boolean;
  productIds?: number[];
  discountValue: string;
}

export interface UpdateDiscountPolicyResponse {
  id: number;
  customerId: number;
  discountType: DiscountType;
  isAppliedAll: boolean;
  productIds: number[];
  discountValue: string;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateDiscountPolicyUseCase {
  constructor(
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateDiscountPolicyDto,
  ): Promise<UpdateDiscountPolicyResponse> {
    // 1. Fetch existing policy
    const policy = await this.discountPolicyRepository.findById(id);
    if (!policy) {
      throw new DiscountPolicyNotFoundException(id);
    }

    // 2. Check if it's used
    if (policy.isUsed) {
      throw new DiscountPolicyUsedException(id);
    }

    const productIds = dto.productIds || [];

    // 3. Validate isAppliedAll vs productIds
    if (dto.isAppliedAll && productIds.length > 0) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If isAppliedAll is true, productIds must be an empty array",
      );
    }

    if (!dto.isAppliedAll && productIds.length === 0) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If isAppliedAll is false, productIds must be a non-empty array",
      );
    }

    // 4. Validate DiscountType vs DiscountValue
    const discountValue = new Decimal(dto.discountValue);
    if (dto.discountType === DiscountType.NONE && discountValue.gt(0)) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If discountType is NONE, discountValue must be 0",
      );
    }

    // 5. Check for conflicts with other policies of the same customer
    const existingPolicies =
      await this.discountPolicyRepository.findByCustomerId(policy.customerId);

    // Filter out the current policy being updated
    const otherPolicies = existingPolicies.filter((p) => p.id !== id);

    if (dto.isAppliedAll) {
      const hasOtherGeneral = otherPolicies.some((p) => p.isAppliedAll);
      if (hasOtherGeneral) {
        throw new DuplicateGeneralDiscountPolicyException(policy.customerId);
      }
    } else {
      for (const productId of productIds) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
          throw new ProductNotFoundException(productId);
        }

        const productAlreadyHasPolicy = otherPolicies.some((p) =>
          p.productIds.includes(productId),
        );
        if (productAlreadyHasPolicy) {
          throw new ProductAlreadyHasDiscountPolicyException(
            policy.customerId,
            productId,
          );
        }
      }
    }

    // 6. Perform update
    const updated = await this.discountPolicyRepository.update(id, {
      discountType: dto.discountType,
      isAppliedAll: dto.isAppliedAll,
      productIds: productIds,
      discountValue: discountValue,
    });

    // 7. Return formatted response
    return {
      id: updated.id,
      customerId: updated.customerId,
      discountType: updated.discountType,
      isAppliedAll: updated.isAppliedAll,
      productIds: updated.productIds,
      discountValue: updated.discountValue.toFixed(3),
      isUsed: updated.isUsed,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../domain/contracts/discount-policy.repository.interface";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { DiscountType } from "../../../domain/enums";
import {
  DuplicateGeneralDiscountPolicyException,
  InvalidDiscountPolicyConfigurationException,
  ProductAlreadyHasDiscountPolicyException,
} from "../../../domain/exceptions/discount-policy.exceptions";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions";
import { Decimal } from "decimal.js";

export interface CreateDiscountPolicyDto {
  customerId: number;
  discountType: DiscountType;
  isAppliedAll: boolean;
  productIds: number[];
  discountValue: string;
}

export interface CreateDiscountPolicyResponse {
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
export class CreateDiscountPolicyUseCase {
  constructor(
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    dto: CreateDiscountPolicyDto,
  ): Promise<CreateDiscountPolicyResponse> {
    // 1. Validate Customer existence
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new CustomerNotFoundException(dto.customerId);
    }

    // 2. Validate isAppliedAll vs productIds
    if (dto.isAppliedAll && dto.productIds.length > 0) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If isAppliedAll is true, productIds must be an empty array",
      );
    }

    if (!dto.isAppliedAll && dto.productIds.length === 0) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If isAppliedAll is false, productIds must be a non-empty array",
      );
    }

    // 3. Validate DiscountType vs DiscountValue
    const discountValue = new Decimal(dto.discountValue);
    if (dto.discountType === DiscountType.NONE && discountValue.gt(0)) {
      throw new InvalidDiscountPolicyConfigurationException(
        "If discountType is NONE, discountValue must be 0",
      );
    }

    // 4. Validate and check for existing policies (Ensure one policy per product)
    const existingPolicies =
      await this.discountPolicyRepository.findByCustomerId(dto.customerId);
    const hasGeneral = existingPolicies.some((p) => p.isAppliedAll);

    if (dto.isAppliedAll) {
      if (hasGeneral) {
        throw new DuplicateGeneralDiscountPolicyException(dto.customerId);
      }
    } else {
      for (const productId of dto.productIds) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
          throw new ProductNotFoundException(productId);
        }

        const productAlreadyHasPolicy = existingPolicies.some((p) =>
          p.productIds.includes(productId),
        );
        if (productAlreadyHasPolicy) {
          throw new ProductAlreadyHasDiscountPolicyException(
            dto.customerId,
            productId,
          );
        }
      }
    }

    // 5. Create the policy
    const created = await this.discountPolicyRepository.create({
      customerId: dto.customerId,
      discountType: dto.discountType,
      isAppliedAll: dto.isAppliedAll,
      productIds: dto.productIds,
      discountValue: discountValue,
    });

    // 6. Return formatted response
    return {
      id: created.id,
      customerId: created.customerId,
      discountType: created.discountType,
      isAppliedAll: created.isAppliedAll,
      productIds: created.productIds,
      discountValue: created.discountValue.toFixed(3),
      isUsed: created.isUsed,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}

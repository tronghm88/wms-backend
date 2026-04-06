import { Inject, Injectable } from "@nestjs/common";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../domain/contracts/discount-policy.repository.interface";
import { CUSTOMER_REPOSITORY } from "../../../domain/contracts/customer.repository.interface";
import type { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import { PRODUCT_REPOSITORY } from "../../../domain/contracts/product.repository.interface";
import type { IProductRepository } from "../../../domain/contracts/product.repository.interface";
import { CustomerNotFoundException } from "../../../domain/exceptions/customer.exceptions";
import { DiscountType } from "../../../domain/enums";

export interface DiscountPolicyWithProductsResponse {
  id: number;
  customerId: number;
  discountType: DiscountType;
  isAppliedAll: boolean;
  productIds: number[];
  products?: { id: number; name: string }[];
  discountValue: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetDiscountPoliciesByCustomerUseCase {
  constructor(
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    customerId: number,
  ): Promise<DiscountPolicyWithProductsResponse[]> {
    // 1. Validate Customer existence
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundException(customerId);
    }

    // 2. Fetch policies
    const policies =
      await this.discountPolicyRepository.findByCustomerId(customerId);

    if (policies.length === 0) {
      return [];
    }

    // 3. Extract all unique productIds
    const allProductIds = new Set<number>();
    policies.forEach((policy) => {
      policy.productIds.forEach((id) => allProductIds.add(id));
    });

    // 4. Fetch product names
    let productMap = new Map<number, string>();
    if (allProductIds.size > 0) {
      const products = await this.productRepository.findByIds(
        Array.from(allProductIds),
      );
      productMap = new Map(products.map((p) => [p.id, p.name]));
    }

    // 5. Map policies to response format
    return policies
      .map((policy) => ({
        id: policy.id,
        customerId: policy.customerId,
        discountType: policy.discountType,
        isAppliedAll: policy.isAppliedAll,
        productIds: policy.productIds,
        products: policy.isAppliedAll
          ? undefined
          : policy.productIds.map((id) => ({
              id,
              name: productMap.get(id) || "Unknown Product",
            })),
        discountValue: policy.discountValue.toFixed(3),
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }
}

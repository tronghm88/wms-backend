import { DiscountPolicyEntity } from "../entities/discount-policy.entity";

export const DISCOUNT_POLICY_REPOSITORY = "DISCOUNT_POLICY_REPOSITORY";

export interface IDiscountPolicyRepository {
  findById(id: number): Promise<DiscountPolicyEntity | null>;
  findByCustomerId(customerId: number): Promise<DiscountPolicyEntity[]>;
  findAppliedAllByCustomerId(
    customerId: number,
  ): Promise<DiscountPolicyEntity | null>;
  create(
    policy: Omit<DiscountPolicyEntity, "id" | "createdAt" | "updatedAt">,
  ): Promise<DiscountPolicyEntity>;
  update(
    id: number,
    policy: Partial<DiscountPolicyEntity>,
  ): Promise<DiscountPolicyEntity>;
  delete(id: number): Promise<void>;
}

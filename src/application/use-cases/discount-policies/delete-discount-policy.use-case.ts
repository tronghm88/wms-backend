import { Inject, Injectable } from "@nestjs/common";
import { DISCOUNT_POLICY_REPOSITORY } from "../../../domain/contracts/discount-policy.repository.interface";
import type { IDiscountPolicyRepository } from "../../../domain/contracts/discount-policy.repository.interface";
import {
  DiscountPolicyNotFoundException,
  DiscountPolicyUsedException,
} from "../../../domain/exceptions/discount-policy.exceptions";

@Injectable()
export class DeleteDiscountPolicyUseCase {
  constructor(
    @Inject(DISCOUNT_POLICY_REPOSITORY)
    private readonly discountPolicyRepository: IDiscountPolicyRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Fetch existing policy
    const policy = await this.discountPolicyRepository.findById(id);
    if (!policy) {
      throw new DiscountPolicyNotFoundException(id);
    }

    // 2. Check if it's used
    if (policy.isUsed) {
      throw new DiscountPolicyUsedException(id);
    }

    // 3. Perform soft delete
    await this.discountPolicyRepository.delete(id);
  }
}

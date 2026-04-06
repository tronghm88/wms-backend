import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { DISCOUNT_POLICY_REPOSITORY } from "../../domain/contracts/discount-policy.repository.interface";
import { CUSTOMER_REPOSITORY } from "../../domain/contracts/customer.repository.interface";
import { PRODUCT_REPOSITORY } from "../../domain/contracts/product.repository.interface";
import { DiscountPolicyRepository } from "../database/repositories/discount-policy.repository";
import { CustomerRepository } from "../database/repositories/customer.repository";
import { ProductRepository } from "../database/repositories/product.repository";
import { CreateDiscountPolicyUseCase } from "../../application/use-cases/discount-policies/create-discount-policy.use-case";
import { GetDiscountPoliciesByCustomerUseCase } from "../../application/use-cases/discount-policies/get-discount-policies-by-customer.use-case";
import { DiscountPoliciesController } from "../../presentation/controllers/discount-policies.controller";

@Module({
  imports: [PrismaModule],
  controllers: [DiscountPoliciesController],
  providers: [
    {
      provide: DISCOUNT_POLICY_REPOSITORY,
      useClass: DiscountPolicyRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    CreateDiscountPolicyUseCase,
    GetDiscountPoliciesByCustomerUseCase,
  ],
  exports: [
    DISCOUNT_POLICY_REPOSITORY,
    CreateDiscountPolicyUseCase,
    GetDiscountPoliciesByCustomerUseCase,
  ],
})
export class DiscountPoliciesModule {}

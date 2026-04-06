# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- **Decimal Serialization:** Always format `Decimal` fields as strings in Use Case responses (using `toFixed(3)`) to satisfy the `NUMERIC(15,3)` requirement and ensure API consistency.
- **Mutual Exclusivity in Discount Policies:** Ensure that a customer cannot have both a "General" (isAppliedAll=true) and "Specific" (productIds list) discount policy to simplify the "one policy per product" logic.
- **Soft Delete with Unique Constraints:** When implementing soft delete in Prisma, consider removing `@@unique` constraints that don't account for `deletedAt` and replacing them with application-level checks to allow multiple soft-deleted records for the same keys.

---

## 2026-04-06 - US-206
- Implemented Create DiscountPolicy API for customers.
- Added stricter conflict checks to ensure "one discount policy per product" rule, even when mixing general and specific policies.
- Created `DiscountPolicyResponseDto` and updated controller to return formatted decimals as strings.
- Files changed:
  - `src/application/use-cases/discount-policies/create-discount-policy.use-case.ts`
  - `src/application/use-cases/discount-policies/create-discount-policy.use-case.spec.ts`
  - `src/presentation/dtos/discount-policies/discount-policy-response.dto.ts`
  - `src/presentation/controllers/discount-policies.controller.ts`
- **Learnings:**
  - Standardized decimal serialization as strings in use cases before returning to presentation layer.
  - Enforced mutual exclusivity between general and specific policies to maintain data integrity.

---

## 2026-04-06 - US-207
- Implemented Get all DiscountPolicies API for a customer.
- Added `findByIds` to `IProductRepository` and `ProductRepository` to support batch fetching of product details.
- Updated `DiscountPolicyResponseDto` to include optional `products` array with names.
- Files changed:
  - `src/domain/contracts/product.repository.interface.ts`
  - `src/infrastructure/database/repositories/product.repository.ts`
  - `src/presentation/dtos/discount-policies/discount-policy-response.dto.ts`
  - `src/application/use-cases/discount-policies/get-discount-policies-by-customer.use-case.ts`
  - `src/infrastructure/discount-policies/discount-policies.module.ts`
  - `src/presentation/controllers/discount-policies.controller.ts`
  - Multiple `.spec.ts` files updated to include `findByIds` mock.
- **Learnings:**
  - Standardized batch fetching of product details in use cases to minimize DB roundtrips.
  - Using `Set` to collect unique IDs from multiple objects before batch fetching is an efficient pattern.
  - Ensuring repository interface changes are reflected across all existing mock objects in tests is critical for type safety.

---

## 2026-04-06 - US-208
- Implemented Update DiscountPolicy API for a customer.
- Added `isUsed` and `deletedAt` fields to `DiscountPolicy` to track policy usage and support historical integrity.
- Enforced "Only unused policies can be updated" rule.
- Added conflict checks to ensure "one policy per product" rule is maintained during updates.
- Created `UpdateDiscountPolicyUseCase` and `UpdateDiscountPolicyDto`.
- Updated `DiscountPolicyResponseDto`, `CreateDiscountPolicyUseCase` and `GetDiscountPoliciesByCustomerUseCase` to include `isUsed` flag.
- Files changed:
  - `prisma/schema.prisma`
  - `src/domain/entities/discount-policy.entity.ts`
  - `src/domain/contracts/discount-policy.repository.interface.ts`
  - `src/infrastructure/database/repositories/discount-policy.repository.ts`
  - `src/domain/exceptions/discount-policy.exceptions.ts`
  - `src/application/use-cases/discount-policies/update-discount-policy.use-case.ts`
  - `src/application/use-cases/discount-policies/update-discount-policy.use-case.spec.ts`
  - `src/application/use-cases/discount-policies/create-discount-policy.use-case.ts`
  - `src/application/use-cases/discount-policies/get-discount-policies-by-customer.use-case.ts`
  - `src/presentation/dtos/discount-policies/update-discount-policy.dto.ts`
  - `src/presentation/dtos/discount-policies/discount-policy-response.dto.ts`
  - `src/presentation/controllers/discount-policies.controller.ts`
  - `src/infrastructure/discount-policies/discount-policies.module.ts`
- **Learnings:**
  - Adding a usage tracking flag (`isUsed`) early is essential for maintaining historical pricing integrity.
  - Prisma 7+ handles datasource configuration differently (managed via `prisma.config.ts`), requiring removal of the `url` property from the schema file in some environments.
  - When updating enums in a shared environment, ensure all code paths are updated to use the new enum values (`NONE`, `PERCENT`, `AMOUNT` instead of `PERCENT`, `FIXED`).

---

## 2026-04-06 - US-209
- Implemented Soft Delete for DiscountPolicies.
- Created `DeleteDiscountPolicyUseCase` with usage tracking check (only unused policies can be deleted).
- Updated `DiscountPolicyRepository` to perform soft delete (setting `deleted_at`) instead of hard delete.
- Added `DELETE` endpoint to `DiscountPoliciesController`.
- Refactored `update-discount-policy.use-case.spec.ts` to fix lint errors and use proper types.
- Removed unique constraint `@@unique([customerId, isAppliedAll])` from `prisma/schema.prisma` to support multiple soft-deleted policies for the same customer.
- Files changed:
  - `src/infrastructure/database/repositories/discount-policy.repository.ts`
  - `src/application/use-cases/discount-policies/delete-discount-policy.use-case.ts`
  - `src/application/use-cases/discount-policies/delete-discount-policy.use-case.spec.ts`
  - `src/infrastructure/discount-policies/discount-policies.module.ts`
  - `src/presentation/controllers/discount-policies.controller.ts`
  - `prisma/schema.prisma`
  - `src/application/use-cases/discount-policies/update-discount-policy.use-case.spec.ts`
- **Learnings:**
  - Soft delete logic should be handled both at the repository level (to filter queries) and the application level (to enforce domain rules like "only unused policies can be deleted").
  - Prisma unique constraints must be carefully evaluated when implementing soft delete; often application-level checks or partial indexes (if supported) are better than a simple unique index on the table.
---

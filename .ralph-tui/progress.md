# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- **Decimal Serialization:** Always format `Decimal` fields as strings in Use Case responses (using `toFixed(3)`) to satisfy the `NUMERIC(15,3)` requirement and ensure API consistency.
- **Mutual Exclusivity in Discount Policies:** Ensure that a customer cannot have both a "General" (isAppliedAll=true) and "Specific" (productIds list) discount policy to simplify the "one policy per product" logic.

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

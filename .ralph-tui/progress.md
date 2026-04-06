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

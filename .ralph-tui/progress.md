# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Standardized Response Wrapping:** For certain stories, controllers manually wrap responses in `{ statusCode, data }` to meet specific API contract requirements.

---

## [2026-04-04] - US-201
- Implement Create customer API.
- Files changed:
  - src/domain/exceptions/customer.exceptions.ts (created)
  - src/domain/contracts/customer.repository.interface.ts (modified)
  - src/infrastructure/database/repositories/customer.repository.ts (created)
  - src/application/use-cases/customers/create-customer.use-case.ts (created)
  - src/presentation/dtos/customers/create-customer.dto.ts (created)
  - src/presentation/controllers/customers.controller.ts (created)
  - src/infrastructure/customers/customers.module.ts (created)
  - src/app.module.ts (modified)
- **Learnings:**
  - Standardized response pattern for this story requires manual wrapping in controller: `{ statusCode, data }`.
  - Uniqueness checks should be performed in the Use Case layer to keep Domain logic pure but orchestration in Application layer.
---

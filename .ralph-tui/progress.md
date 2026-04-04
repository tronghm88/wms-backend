# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Standardized Response Wrapping:** For certain stories, controllers manually wrap responses in `{ statusCode, data }` to meet specific API contract requirements.
- **Repository Pagination:** Use `findAndCount(params): Promise<[Entity[], number]>` pattern for paginated search in repositories.

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

## [2026-04-04] - US-202
- Implement Get customers API with pagination and search.
- Files changed:
  - src/domain/contracts/customer.repository.interface.ts (modified)
  - src/infrastructure/database/repositories/customer.repository.ts (modified)
  - src/presentation/dtos/customers/get-customers.dto.ts (created)
  - src/application/use-cases/customers/get-customers.use-case.ts (created)
  - src/application/use-cases/customers/get-customers.use-case.spec.ts (created)
  - src/infrastructure/customers/customers.module.ts (modified)
  - src/presentation/controllers/customers.controller.ts (modified)
  - src/presentation/controllers/customers.controller.spec.ts (created)
- **Learnings:**
  - Standardized response pattern for Customer module requires `{ statusCode, data }` wrapping in the controller.
  - Repository `findAndCount` pattern is used for pagination, returning a tuple `[Entity[], number]`.
  - Pagination DTOs should include `page` and `limit` with sensible defaults (e.g., page 1, limit 20).
---

# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Dependency Injection**: Use string constants for repository interfaces (e.g., `USER_REPOSITORY`, `UNIT_REPOSITORY`) to decouple Application layer from Infrastructure.
- **Clean Architecture Layers**:
    - **Domain**: Entities and repository interfaces (contracts).
    - **Application**: Use cases with `execute` method and `Request`/`Response` interfaces.
    - **Infrastructure**: Prisma repositories, NestJS modules.
    - **Presentation**: Controllers, DTOs with `class-validator` and `nestjs/swagger`.
- **Data Mapping**: Repositories use a private `mapToDomain` method to convert Prisma models to Domain Entities.
- **RBAC**: Use `RequirePermissions(Permissions.XXX)` decorator on controller methods to enforce permissions.
- **Exceptions**: Custom domain exceptions extending a base exception (e.g., `AuthException`, `UnitException`, `CategoryException`) with an `errorCode`.
- **Global Error Handling**: `GlobalExceptionFilter` maps domain exceptions (by `errorCode`) to proper HTTP status codes.

## 2026-04-04 - US-001
- Implemented `POST /api/v1/units` endpoint for creating units.
- Added `UNITS_MANAGE` permission to `Permissions` constant.
- Created `UnitEntity`, `IUnitRepository`, and `UNIT_REPOSITORY` constant in Domain.
- Created `CreateUnitUseCase` in Application.
- Implemented `UnitRepository` with Prisma in Infrastructure.
- Created `UnitsModule` and registered it in `AppModule`.
- Created `UnitsController` and `CreateUnitDto` in Presentation.
- Added unit tests for `CreateUnitUseCase`.
- Verified with `npm run lint` and `npx tsc --noEmit`.

- **Learnings:**
  - `Unit` table uses `code` as its primary key (String).
  - RBAC is enforced via `RequirePermissions` decorator which checks against `user.permissions` or `user.role === 'ADMIN'`.

## 2026-04-04 - US-005
- What was implemented:
  - Categories management module foundation.
  - POST /api/v1/categories endpoint with Swagger documentation and RBAC (CATEGORIES_MANAGE).
  - CreateCategoryUseCase with uniqueness check for manual code.
  - CategoryRepository implementation with Prisma.
  - Custom CategoryExceptions for better error handling.
  - Improved GlobalExceptionFilter to automatically map domain exceptions to proper HTTP statuses.
- Files changed:
  - src/domain/constants/permissions.constant.ts
  - src/domain/contracts/category.repository.interface.ts
  - src/domain/exceptions/category.exceptions.ts
  - src/infrastructure/database/repositories/category.repository.ts
  - src/application/use-cases/categories/create-category.use-case.ts
  - src/application/use-cases/categories/create-category.use-case.spec.ts
  - src/presentation/dtos/categories/create-category.dto.ts
  - src/presentation/controllers/categories.controller.ts
  - src/infrastructure/categories/categories.module.ts
  - src/app.module.ts
  - src/presentation/filters/global-exception.filter.ts
  - src/application/use-cases/units/create-unit.use-case.spec.ts (lint fix)
- **Learnings:**
  - **Patterns discovered:** Domain exceptions follow a pattern of having an `errorCode` property which can be leveraged in a global filter for uniform API error responses.
  - **Gotchas encountered:** Existing spec files had some linting issues (unbound-method and any-usage) that needed fixing to pass CI gates.
---

## 2026-04-04 - US-002
- Implemented GET /api/v1/units endpoint.
- Created GetUnitsUseCase with unit tests.
- Updated UnitsController and UnitsModule.
- Files changed:
  - src/application/use-cases/units/get-units.use-case.ts
  - src/application/use-cases/units/get-units.use-case.spec.ts
  - src/infrastructure/units/units.module.ts
  - src/presentation/controllers/units.controller.ts
- **Learnings:**
  - **Patterns discovered:** Standard Clean Architecture pattern: Controller -> Use Case -> Repository (via Interface).
  - **Gotchas encountered:** Importance of using "import type" for interfaces in NestJS use cases to satisfy linter and compiler (isolatedModules).
  - Use of /* eslint-disable @typescript-eslint/unbound-method */ in test files when testing with jest-mocked repositories.
---

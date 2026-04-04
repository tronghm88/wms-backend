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
- **Exceptions**: Custom domain exceptions extending a base exception (e.g., `AuthException`, `UnitException`) with an `errorCode`.

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
---


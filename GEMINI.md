# GEMINI.md - Project Mandates & Global Rules

## 1. Project Overview
- **Project:** Warehouse Management System (WMS) Backend.
- **Stack:** NestJS, PostgreSQL (v16), Redis, Prisma ORM.
- **Architecture:** Strict Clean Architecture (Domain, Application, Infrastructure, Presentation).

## 2. Architectural Boundaries
- **Domain Layer (`src/domain`):** Must be a "Pure" layer. Zero dependencies on NestJS, Prisma, or any external libraries (except basic utilities like `decimal.js`). **NEVER** use NestJS or Prisma decorators here.
- **Application Layer (`src/application`):** Contains Use Cases. Orchestrates between Presentation and Domain/Infrastructure layers.
- **Infrastructure Layer (`src/infrastructure`):** Implementations of interfaces defined in the Domain/Contract layer to ensure the core is decoupled from the database (e.g., Prisma repositories, Redis).
- **Presentation Layer (`src/presentation`):** Controllers, API DTOs, Guards, and Filters. HTTP context must not leak beyond this layer.
- **Dependency Injection:** Use NestJS DI, but ensure Domain logic remains testable without a NestJS container.

## 3. Data Integrity & Precision
- **Decimal Precision:** All numeric metrics (weight, quantity, length, volume) and currency fields MUST use PostgreSQL `NUMERIC(15,3)`.
- **Backend Math:** Use `decimal.js` for all calculations before persisting to the database. NEVER use floating-point numbers (`number`) for business logic.
- **API Serialization (CRITICAL):** All `NUMERIC(15,3)` fields MUST be serialized as `String` in the API JSON responses to prevent Javascript/Dart floating point truncation natively.
- **Database Naming:** All database tables and columns MUST use `snake_case`. Use Prisma `@map` and `@@map` to maintain TypeScript `camelCase` while keeping DB `snake_case`.

## 4. API & Documentation (Mandatory)
- **Swagger/OpenAPI:** Every controller and endpoint MUST be fully documented using `@nestjs/swagger` decorators (e.g., `@ApiTags`, `@ApiOperation`, `@ApiResponse`).
- **Endpoint Availability:** Swagger UI must be configured at `/api/docs` with the title "WMS Backend API" and be accessible in development to ensure the frontend team can integrate immediately.
- **Standardized Responses:** Use a global `ExceptionFilter` to return consistent JSON error objects.

## 5. Security & Authentication
- **Authentication:** JWT-based. Access tokens (15m), Refresh tokens (7d).
- **Session Management:** Refresh tokens MUST be stored in Redis for instant revocation.
- **RBAC Logic:** 
    - Roles (`SUPER_ADMIN`, `ADMIN`, `WAREHOUSE_STAFF`) are hardcoded in source code constants.
    - `custom_permissions` in the `User` table is a "Total Override" logic:
        - `NULL`: Use hardcoded Role permissions.
        - `[]` or Populated: Use these permissions exclusively, bypassing the Role.
    - Resolved permissions for the current session MUST be cached in Redis (`session:user_data:{userId}`).

## 6. Development Quality Gates & Linting
- **Linter:** `npm run lint` must pass before any task is considered complete.
- **Type Safety:** `npx tsc --noEmit` must pass.
- **Validation:** Use `class-validator` and `class-transformer` for all DTOs to enforce runtime type safety.
- **ESLint/TypeScript Rules Enforcement:**
  - Prefix unused variables with `_` to satisfy `@typescript-eslint/no-unused-vars` (set to `error`).
  - Do not leave floating promises. Always `await` or handle promises (`@typescript-eslint/no-floating-promises` is `warn`).
  - Avoid `any` types where possible (`@typescript-eslint/no-explicit-any` is `warn`).
  - Prettier formatting is enforced (`endOfLine: "auto"`).

## 7. Naming & Formatting Conventions
- **NestJS Files:** Must use `kebab-case` with dot suffixes indicating component type (e.g., `create-goods-issue.use-case.ts`, `goods-receipt.controller.ts`).
- **NestJS Classes:** `PascalCase` with intent suffix (e.g., `CreateGoodsIssueUseCase`).
- **REST Endpoints:** Must be `kebab-case` and plural (e.g., `/api/v1/price-policies`).
- **Query/Params:** Must be `camelCase` (e.g., `?customerId=123`).
- **Dates:** Always ISO 8601 UTC strings (e.g., `2026-03-30T10:00:00Z`).

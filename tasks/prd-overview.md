#
 PRD: Epic 1 - Authentication & System Foundation (Backend)

## Overview
This PRD covers the foundational setup of the WMS backend. It establishes the infrastructure (Docker, NestJS, PostgreSQL, Redis), defines the core database models (including the User schema), and implements a secure JWT-based Authentication
 system with a custom RBAC (Role-Based Access Control) resolution logic.

## Goals
- Initialize the NestJS project with a strict Clean Architecture structure.
- Define a comprehensive Prisma schema with high-precision decimal support (`NUMERIC(15,3)`).
- Implement JWT authentication with Redis-
backed session management.
- Establish the RBAC system with hardcoded roles and `custom_permissions` override logic.
- Ensure all APIs are documented via Swagger at `/api/docs`.

## Global Mandates (Refer to GEMINI.md)
*   **Precision:** All weights, quantities, and
 prices MUST use `Decimal` mapped to `@db.Decimal(15, 3)`.
*   **Naming:** Database mapping MUST use `snake_case` via `@map` and `@@map`.
*   **Documentation:** Every endpoint MUST be documented with `@nestjs/swagger` decorators.

##
 Quality Gates
- `npm run lint` - Must pass with zero errors.
- `npx tsc --noEmit` - Must pass for type safety.

## User Stories

### US-001: Infrastructure & Project Setup
**Description:** As a developer, I want to initialize the project with Docker
 and Clean Architecture folders.
**Acceptance Criteria:**
- [ ] Initialize NestJS project.
- [ ] Create `docker-compose.yml` with PostgreSQL 16 and Redis.
- [ ] Establish folders: `src/domain`, `src/application`, `src/infrastructure`, `src/
presentation`.
- [ ] Configure `SwaggerModule` at `/api/docs` with title "WMS Backend API".

### US-002: Core Prisma Schema & User Model
**Description:** As a System Architect, I want to define the database schema.
**Acceptance Criteria:**
- [ ] **
User Model Implementation:**
    - `id` (UUID), `email` (Unique), `password_hash`, `full_name`, `role` (String), `custom_permissions` (String[]?, nullable).
- [ ] Define Master Data (Category, Product, Customer) and Inventory (StockBalance
, StockMovement).
- [ ] Ensure all numeric fields use `@db.Decimal(15, 3)`.
- [ ] Apply `snake_case` mapping to all tables and columns.

### US-003: JWT Authentication with Redis Session
**Description:** As a user, I
 want to log in securely.
**Acceptance Criteria:**
- [ ] Implement `Login` with `bcrypt` validation.
- [ ] Generate JWT Access (15m) and Refresh (7d) tokens.
- [ ] Store hashed Refresh Tokens in Redis (`session:refresh_token:{userId}`).

- [ ] Implement `Logout` to invalidate the Redis session.

### US-004: RBAC Resolution Logic
**Description:** As an Admin, I want the system to enforce permissions using the override strategy.
**Acceptance Criteria:**
- [ ] Implement `@RequirePermissions()` decorator and Guard.
-
 [ ] **Resolution Strategy:**
    - If `custom_permissions` is `NULL` -> Use hardcoded Role defaults (SUPER_ADMIN, ADMIN, WAREHOUSE_STAFF).
    - If `custom_permissions` is `[]` or populated -> Use these permissions exclusively.
- [ ] Cache resolved permissions
 in Redis (`session:user_data:{userId}`) on successful login/refresh.

## Technical Considerations
- Use `decimal.js` for all backend arithmetic.
- Use Repository pattern in `src/domain/contracts`.
- All DTOs must use `class-validator`.

## Success Metrics

- Swagger UI is live at `/api/docs`.
- Unauthorized requests return `401`.
- Permission violations return `403`.
- Database precision is verified at 3 decimal places.
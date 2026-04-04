# PRD: Epic 1 - Authentication & System Foundation
 (Backend)

## Overview
This PRD covers the initialization of the WMS backend ecosystem. It establishes the infrastructure (Docker, NestJS, Redis, PostgreSQL), defines the complete database schema to ensure data integrity (NUMERIC(15,3)), and implements a secure Authentication and RBAC (Role-Based Access Control)
 system. This foundation is critical for the "Always-Online" and "Precision Mathematics" requirements of the warehouse.

## Goals
- Initialize a scalable NestJS project following strict Clean Architecture boundaries.
- Define a comprehensive Prisma schema covering Master Data, Transactions, and Inventory.
- Implement secure JWT-based authentication
 with Redis-backed Refresh Tokens.
- Establish an RBAC system that supports both fixed roles and custom permission overrides.
- Ensure all numeric calculations are protected by high-precision database types.

## Quality Gates

These commands must pass for every user story:
- `npm run lint` - Code style and quality
 check
- `npm run test` - Unit and integration tests
- `npx tsc --noEmit` - TypeScript type checking

## User Stories

### US-001: Project Infrastructure & Docker Setup
**Description:** As a developer, I want to set up the base project structure and container
ized services so that the environment is consistent across development and production.

**Acceptance Criteria:**
- [ ] Initialize NestJS project with `@nestjs/cli`.
- [ ] Create `docker-compose.yml` with PostgreSQL 16 and Redis services.
- [ ] Configure `.env` templates for database
 and Redis connection strings.
- [ ] Set up the Clean Architecture folder structure: `src/domain`, `src/application`, `src/infrastructure`, `src/presentation`.
- [ ] Ensure `src/domain` has zero dependencies on NestJS or external frameworks.

### US-002: Core Database
 Schema Definition (Prisma)
**Description:** As a System Architect, I want to define all database tables and relationships upfront so that the entire system has a consistent data model.

**Acceptance Criteria:**
- [ ] Define `User`, `Role`, and `SystemConfig` models.
- [ ]
 Define Master Data models: `Category`, `Product`, `Customer`, `PricePolicy`.
- [ ] Define Transaction models: `GoodsReceipt`, `GoodsIssue`, `SplitOperation` (and their respective Line models).
- [ ] Define Inventory models: `StockBalance` and `StockMovement` (Audit Log
).
- [ ] **CRITICAL:** Use `Decimal` types for all metrics and prices, mapped to `NUMERIC(15,3)` in PostgreSQL via Prisma `@db.Decimal(15, 3)`.
- [ ] Use `@@map` and `@map` to ensure database tables/
columns use `snake_case`.

### US-003: Secure JWT Authentication with Redis
**Description:** As a user, I want to log in with my email/password and receive a JWT so that I can securely access the system.

**Acceptance Criteria:**
- [ ] Implement `Login` use case
 with `bcrypt` password hashing.
- [ ] Generate short-lived JWT Access Tokens and long-lived Refresh Tokens.
- [ ] Store hashed Refresh Tokens in Redis (`session:refresh_token:{userId}`) for instant invalidation.
- [ ] Implement a `Logout` endpoint that clears the session from Redis
.
- [ ] Handle `401 Unauthorized` for expired or invalid tokens.

### US-004: RBAC & Permission Guarding
**Description:** As an Admin, I want the system to enforce permissions based on my assigned role or custom overrides so that sensitive data is protected.

**
Acceptance Criteria:**
- [ ] Implement a custom `@RequirePermissions()` decorator.
- [ ] Create a NestJS Guard that fetches user permissions from Redis (`session:user_data:{userId}`) or fallback to DB.
- [ ] Support three default roles: `SUPER_ADMIN`, `ADMIN`, `WARE
HOUSE_STAFF`.
- [ ] Support `custom_permissions` (String array) in the User model that overrides role defaults.
- [ ] Ensure API responses return `403 Forbidden` if permissions are insufficient.

### US-005: Global System Configuration API
**Description:** As an Admin,
 I want to manage global variables (like unit names or format templates) so that they are standardized across the system.

**Acceptance Criteria:**
- [ ] CRUD endpoints for `SystemConfig` (Key-Value pairs).
- [ ] Cache configurations in Redis for high-speed retrieval.
- [ ] Ensure only
 `ADMIN` or `SUPER_ADMIN` roles can modify configurations.

## Functional Requirements
- **FR-1:** All password storage must use `bcrypt` with a salt factor of 10+.
- **FR-2:** JWT tokens must be passed in the `Authorization: Bearer <token>` header.

- **FR-3:** The system must use a global `ExceptionFilter` to return standardized error JSON.
- **FR-4:** Database migrations must be managed via Prisma Migrate.
- **FR-5:** Numeric fields must be serialized as `Strings` in JSON to prevent precision loss.

##
 Non-Goals
- Frontend implementation (Flutter) is out of scope for this PRD.
- Multi-warehouse logic (Phase 1 is single-warehouse only).
- Integration with external accounting software (MISA/SAP).

## Technical Considerations
- **Precision:** Use `decimal.js` or
 similar in the backend if doing math before saving to DB.
- **Clean Architecture:** Use Repository interfaces in `domain/contracts` to decouple the database.
- **Swagger:** Use `@nestjs/swagger` to document all endpoints for the Flutter team.

## Success Metrics
- 100% of numeric fields in
 the DB use `NUMERIC(15,3)`.
- JWT authentication successfully blocks unauthorized requests.
- Permission changes in the DB take effect immediately (via Redis invalidation).
- API response time for Auth/Config is `< 200ms`.

## Open Questions
- Should we support
 "Social Login" (Google/OIDC) in the future? (Deferred to Phase 2).
- What is the exact expiration time for Access vs Refresh tokens? (Proposed: 15m / 7d).
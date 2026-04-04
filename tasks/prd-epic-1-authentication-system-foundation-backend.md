# PRD: Epic 1 - Authentication & System Foundation (Backend)

## Overview
This PRD covers the initialization of the WMS backend ecosystem. It establishes the infrastructure, defines the complete database schema (including the specific `User` model), and implements a
 secure Authentication and RBAC system based on hardcoded roles and permission overrides.

## Goals
- Initialize a scalable NestJS project following strict Clean Architecture boundaries.
- Define a comprehensive Prisma schema covering Master Data, Transactions, and Inventory.
- Implement secure JWT-based authentication with Redis-backed Refresh Tokens.
-
 Establish an RBAC system that supports both fixed roles and custom permission overrides.

## Global Rules & Quality Gates
*   **Rule 1 (Precision):** All numeric metrics and prices MUST use `Decimal` type mapped to `@db.Decimal(15, 3)`.
*   **Rule 2 (
Naming):** Database tables and columns MUST use `snake_case` via Prisma `@map` and `@@map`.
*   **Gate 1:** `npm run lint` (Code quality)
*   **Gate 2:** `npx tsc --noEmit` (Type safety)

##
 User Stories

### US-001: Project Infrastructure & Docker Setup
**Description:** As a developer, I want to set up the base project structure and containerized services.
**Acceptance Criteria:**
- [ ] Initialize NestJS project.
- [ ] Create `docker-compose.yml` with
 PostgreSQL 16 and Redis.
- [ ] Set up Clean Architecture structure: `src/domain`, `src/application`, `src/infrastructure`, `src/presentation`.

### US-002: Core Database Schema & User Model
**Description:** As a System Architect, I want to define all
 database tables, specifically the `User` model, to ensure a consistent data model.
**Acceptance Criteria:**
- [ ] **Define User Model:**
    - `id` (String, uuid)
    - `email` (String, unique)
    - `password_hash` (String
)
    - `full_name` (String)
    - `role` (String)
    - `custom_permissions` (String[]?, nullable)
- [ ] Define Master Data (Category, Product, Customer) and Transactions (GoodsReceipt, GoodsIssue, SplitOperation).
- [ ]
 **CRITICAL:** Use `@db.Decimal(15, 3)` for all weight/quantity/price fields.

### US-003: RBAC & Permission Resolution
**Description:** As an Admin, I want the system to enforce permissions based on roles or custom overrides.
**Acceptance
 Criteria:**
- [ ] **Permission List:** USERS_VIEW, USERS_MANAGE, CONFIG_VIEW, CONFIG_MANAGE, PRODUCTS_VIEW, PRODUCTS_MANAGE, CUSTOMERS_VIEW, CUSTOMERS_MANAGE, INBOUND_CREATE, INBOUND_CONFIRM, OUTBOUND_
CREATE, OUTBOUND_CONFIRM, STOCK_VIEW, STOCK_SPLIT, STOCK_REVERSAL, AUDIT_VIEW, REPORT_EXPORT_PDF, REPORT_EXPORT_EXCEL.
- [ ] **Resolution Logic:** 
    - If `custom_permissions` is `NULL` -> Use hard
coded role defaults.
    - If `custom_permissions` is `[]` or populated -> Use only those permissions (override role).
- [ ] Cache resolved permissions in Redis (`session:user_data:{userId}`).

### US-004: Secure JWT Authentication with Redis
**Description:** Implement login/
logout using JWT and Redis-backed Refresh Tokens.
**Acceptance Criteria:**
- [ ] Store hashed Refresh Tokens in Redis.
- [ ] Implement `Login` and `Logout` endpoints.

## Technical Considerations
- Use Repository pattern in `domain/contracts`.
- JWT expiration: Access (15m),
 Refresh (7d).
- High-precision math must be handled via `decimal.js` before DB persistence.
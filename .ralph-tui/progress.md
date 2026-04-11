# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Status Mapping:** Always use explicit mapper functions (e.g., `mapStatusToPrisma` and `mapStatusToDomain`) in repositories when the domain enum differs from the Prisma/Database enum to ensure type safety and handle diverging business logic naming.
- **Prisma Entity Mapping:** Use `Prisma.XGetPayload<{ include: { ... } }>` as the input type for `toEntity` private methods in repositories to provide full type safety when mapping complex models with relations.

## [2026-04-11] - US-401
- Defined Issue Ticket Domain Model including `IssueTicketEntity`, `IssueTicketLineEntity`, and `IssueTicketStatus` enum.
- Defined `IIssueTicketRepository` interface.
- Files changed:
  - `src/domain/entities/issue-ticket.entity.ts`
  - `src/domain/entities/issue-ticket-line.entity.ts` (verified)
  - `src/domain/contracts/issue-ticket.repository.interface.ts`
  - `src/domain/enums/index.ts`
- **Learnings:**
  - `IssueTicket` uses `code` instead of `ticketNo` to match requirements, diverging from `ReceiptTicket` convention.
  - Domain entities use `decimal.js` for all numeric fields to ensure precision.
  - Aggregate structure includes lines directly in the main entity for `IssueTicket`.

## [2026-04-11] - US-402
- Implemented `PricingEngineService` in `src/domain/services/`.
- Implemented discount hierarchy: 1. Product-specific > 2. General > 3. Base price.
- Added comprehensive unit tests for pricing logic.
- Files changed:
  - `src/domain/services/pricing-engine.service.ts`
  - `src/domain/services/pricing-engine.service.spec.ts`
- **Learnings:**
  - Although the requirement mentions "Category/General", the current domain model (`DiscountPolicyEntity`) only supports `isAppliedAll` (General) and `productIds` (Specific).
  - Calculations use `decimal.js` and are rounded to 3 decimal places to match `NUMERIC(15,3)` database precision.
  - `PricingEngineService` is implemented as a pure domain service with static methods to ensure zero external dependencies.

## [2026-04-11] - US-406
- Implemented `PrismaIssueTicketRepository` in `src/infrastructure/database/repositories/prisma-issue-ticket.repository.ts`.
- Updated `IIssueTicketRepository` interface to include `lines` in `create` and `update` to support transactions.
- Updated `IssueTicketsModule` to provide `PrismaIssueTicketRepository`.
- Files changed:
  - `src/infrastructure/database/repositories/prisma-issue-ticket.repository.ts`
  - `src/domain/contracts/issue-ticket.repository.interface.ts`
  - `src/infrastructure/issue-tickets/issue-tickets.module.ts`
  - `src/domain/services/issue-ticket-code-generator.service.spec.ts` (fixed lint errors)
- **Learnings:**
  - Prisma nested `create` and `$transaction` were used to ensure the Issue Ticket and its Lines are saved together atomically as per requirements.
  - Domain status `IssueTicketStatus` (`DRAFT`, `COMPLETED`, `CANCELLED`) was mapped to Prisma `TransactionStatus` (`DRAFT`, `CONFIRMED`, `VOIDED`).
  - `Decimal` fields in Prisma (mapped as `Decimal`) must be explicitly converted to `decimal.js` using `.toString()` to avoid type mismatches.
## [2026-04-11] - US-404
- Implemented `CreateIssueTicketUseCase` in `src/application/use-cases/issue-tickets/`.
- Integrated `PricingEngineService` for automatic pricing calculation based on customer policies.
- Implemented stock sufficiency validation for all lines, summing quantities for same products.
- Created `NegativeStockException` (ErrorCode: `NEGATIVE_STOCK`) and `IssueTicketException`.
- Updated `CreateIssueTicketDto` to include lines and added `CreateIssueTicketLineDto`.
- Updated `IssueTicketsModule` to import required repository modules.
- Added comprehensive unit tests for the use case.
- Files changed:
  - `src/application/use-cases/issue-tickets/create-issue-ticket.use-case.ts`
  - `src/application/dtos/create-issue-ticket.dto.ts`
  - `src/domain/exceptions/inventory.exceptions.ts`
  - `src/domain/exceptions/issue-ticket.exceptions.ts`
  - `src/infrastructure/issue-tickets/issue-tickets.module.ts`
  - `src/application/use-cases/issue-tickets/create-issue-ticket.use-case.spec.ts`
- **Learnings:**
  - Aggregating line quantities before stock validation is crucial to prevent "split-line" overdrafts where multiple lines of the same product individually pass but collectively fail stock checks.
  - Using `Promise.all` for fetching multiple repositories (Products, Policies, Inventory) significantly improves performance by reducing sequential I/O wait times.
  - Strict mapping between domain `Decimal` (decimal.js) and Prisma `Decimal` (decimal.js but via different instance usually) requires careful conversion using `.toString()` or explicit casts.

## [2026-04-11] - US-405
- Updated `IssueTicketLine` schema and entity to support `isOverride` and `originalPrice`.
- Modified `CreateIssueTicketUseCase` to allow manual price overrides with RBAC checks.
- Added `ISSUES_PRICE_OVERRIDE` permission to `Permissions` constant.
- Implemented `IssueTicketsController` and `IssueTicketResponseDto` to expose the creation endpoint.
- Added comprehensive unit tests for price override logic, including permission validation.
- Files changed:
  - `prisma/schema.prisma`
  - `src/domain/entities/issue-ticket-line.entity.ts`
  - `src/infrastructure/database/repositories/prisma-issue-ticket.repository.ts`
  - `src/domain/constants/permissions.constant.ts`
  - `src/application/dtos/create-issue-ticket.dto.ts`
  - `src/application/use-cases/issue-tickets/create-issue-ticket.use-case.ts`
  - `src/application/use-cases/issue-tickets/create-issue-ticket.use-case.spec.ts`
  - `src/presentation/dtos/issue-tickets/issue-ticket-response.dto.ts`
  - `src/presentation/controllers/issue-tickets.controller.ts`
  - `src/infrastructure/issue-tickets/issue-tickets.module.ts`
- **Learnings:**
  - RBAC checks can be implemented directly within Use Cases for fine-grained control over specific fields/actions that go beyond simple endpoint access.
  - Logging "events" for auditing can be done via standard `Logger` in NestJS, though a dedicated `AuditLog` table might be preferred for long-term searchable history as per PRD vision.
  - When updating Use Case signatures (e.g., from `userId` to `user` object), all related tests must be updated to maintain type safety and pass linting.

## [2026-04-11] - US-407
- Implemented `complete` method in `PrismaIssueTicketRepository` to handle status transitions and stock updates.
- Integrated inventory reduction and outbound stock movement logging within a Prisma transaction for atomicity.
- Created `CompleteIssueTicketUseCase` to orchestrate the completion process.
- Exposed `PATCH /api/v1/issue-tickets/:id/complete` endpoint in `IssueTicketsController`.
- Added `IssueTicketNotFoundException` and `InvalidIssueTicketStatusException` for precise error handling.
- Files changed:
  - `src/domain/contracts/issue-ticket.repository.interface.ts`
  - `src/infrastructure/database/repositories/prisma-issue-ticket.repository.ts`
  - `src/domain/exceptions/issue-ticket.exceptions.ts`
  - `src/application/use-cases/issue-tickets/complete-issue-ticket.use-case.ts`
  - `src/application/use-cases/issue-tickets/complete-issue-ticket.use-case.spec.ts`
  - `src/infrastructure/issue-tickets/issue-tickets.module.ts`
  - `src/presentation/controllers/issue-tickets.controller.ts`
- **Learnings:**
  - Following the `ReceiptTicketRepository` pattern, cross-aggregate atomic updates (Ticket + Inventory + StockMovement) are handled within the repository using Prisma's `$transaction`.
  - Reusing existing `ISSUES_CONFIRM` permission instead of creating a new one to maintain consistency with the `Receipts` module.
  - `Prisma.Decimal` from the client can be manipulated directly for simple operations like `mul(-1)` but should be converted to `decimal.js` if complex business logic is needed.
---

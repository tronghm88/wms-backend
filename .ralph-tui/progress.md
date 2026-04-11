# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

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
---


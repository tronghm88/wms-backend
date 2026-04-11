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
---


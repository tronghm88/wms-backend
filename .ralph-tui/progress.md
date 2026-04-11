# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Admin Override for Confirmed Transactions:** Use cases that modify confirmed transactions (like Receipt Tickets) should check for `isAdmin` flag. If it's a confirmed ticket and user is Admin, perform the action using special repository methods that handle stock adjustment (e.g., `addLineWithStockAdjustment`, `updateLineWithStockAdjustment`, `deleteLineWithStockAdjustment`). If it's confirmed and NOT an Admin, throw a `NotDraftException`.
- **Atomic Transaction for Stock Operations:** When updating stock, always wrap status changes, stock balance updates, and stock movement logs in a single Prisma transaction (`$transaction`).

---

## 2026-04-11 - US-307
- Implemented and verified `POST /api/v1/receipt-tickets/{id}/confirm` endpoint.
- Implemented `DELETE /api/v1/receipt-tickets/{id}` for both Drafts and Confirmed tickets (Admin only for confirmed).
- Added `RECEIPTS_DELETE` permission.
- Updated `ReceiptTicketRepository` with methods for whole ticket deletion and stock adjustment.
- Enforced immutability for standard users on confirmed tickets across all relevant use cases.
- Created unit tests for `ConfirmReceiptTicketUseCase` and `DeleteReceiptTicketUseCase`.
- Fixed several broken tests due to signature changes.
- **Learnings:**
  - Standardizing `isAdmin` and `userId` across operative use cases ensures consistent audit logging and permission enforcement.
  - Manual deletion of child records in transactions is safer when Prisma cascade delete is not explicitly confirmed in schema.
---


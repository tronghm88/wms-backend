# PRD: Epic 3 - Inbound Operations & Stock Generation

## 1. Introduction/Overview
This Epic focuses on the "Inbound" lifecycle of the warehouse, enabling staff to record incoming shipments (Goods
 Receipts). It includes a draft-to-confirmation workflow, an automated Unit Conversion Engine to prevent calculation errors, and strict data integrity through immutable records and audit trails.

## 2. Goals
- Provide a robust mechanism for creating and managing Goods Receipt tickets (PN-xxxx).
- Automate metric calculations (
m², kg) during line item entry using a centralized Unit Conversion Engine.
- Ensure stock levels are only updated upon explicit confirmation.
- Maintain a 100% accurate, immutable audit trail for every stock movement.
- Deliver high-performance APIs (under 500ms) with strict numeric
 precision (NUMERIC(15,3)).

## 3. Quality Gates
These commands must pass for every user story:
- `npm run lint` - Linting and formatting checks.
- `npx tsc --noEmit` - TypeScript type checking.

## 4. User Stories


### US-001: Create Goods Receipt Draft
**Description:** As a Warehouse Staff member, I want to initiate a new Goods Receipt for an incoming shipment so that I can begin drafting the manifest.

**Acceptance Criteria:**
- [ ] Create `POST /api/v1/receipt-
tickets` endpoint.
- [ ] Accept `notes` (optional) and automatically link the `creatorId` (from authenticated user).
- [ ] **Ticket ID Generation:** Generate a unique ID following `PN-YYYYMM-N` format (e.g., `PN-20260
4-1`).
- [ ] `N` must be a sequential increment resetting at the start of each month.
- [ ] Set initial status to `DRAFT`.
- [ ] Return the created ticket object with its ID and timestamp.
- [ ] Ensure the Ticket ID sequence is transaction-safe
 and handles concurrency.

### US-002: Add Line Item to Receipt (with Unit Engine)
**Description:** As a Warehouse Staff member, I want to add a product roll to my receipt draft and see its converted metrics (m², kg) immediately.

**Acceptance Criteria:**
- [
 ] Create `POST /api/v1/receipt-tickets/{id}/lines` endpoint.
- [ ] Validate that the parent Ticket is in `DRAFT` status.
- [ ] Accept `productId` and physical dimensions (e.g., `length_m`).
- [ ] Invoke the
 `UnitConversionEngine` (Domain Layer) to calculate `area_m2` and `weight_kg` based on product category rules.
- [ ] Persist the line item and return the calculated metrics in the response for real-time UI feedback.
- [ ] All numeric fields must be handled as
 `Decimal` (decimal.js) and stored as `NUMERIC(15,3)`.

### US-003: Update Line Item in Receipt
**Description:** As a Warehouse Staff member, I want to edit a previously added line item if I made a mistake during entry.

**Accept
ance Criteria:**
- [ ] Create `PATCH /api/v1/receipt-tickets/{id}/lines/{lineId}` endpoint.
- [ ] Re-trigger the `UnitConversionEngine` if physical dimensions are changed.
- [ ] Update the line item record in the database.
- [
 ] Return the updated line with fresh calculations.
- [ ] Block updates if the parent Ticket status is no longer `DRAFT` (unless current user is Admin).

### US-004: Delete Line Item from Receipt
**Description:** As a Warehouse Staff member, I want to remove a line item
 from my draft receipt.

**Acceptance Criteria:**
- [ ] Create `DELETE /api/v1/receipt-tickets/{id}/lines/{lineId}` endpoint.
- [ ] Verify the line belongs to the specified ticket.
- [ ] Block deletion if ticket is not `DRAFT
` (unless current user is Admin).
- [ ] Perform a hard delete for line items belonging to draft tickets.

### US-005: Get Goods Receipt Details
**Description:** As a Warehouse Staff member, I want to view the full details of a specific receipt, including all its line items.

**Acceptance Criteria:**
- [ ] Create `GET /api/v1/receipt-tickets/{id}` endpoint.
- [ ] Include all related line items and calculated totals (total m2, total kg, total rolls).
- [ ] Include `notes` and `creatorId` in the
 response.
- [ ] Ensure proper serialization of `NUMERIC` fields as `String` in the JSON response.

### US-006: List Goods Receipts
**Description:** As a Manager, I want to browse and filter past and current receipt tickets.

**Acceptance Criteria:**
- [
 ] Create `GET /api/v1/receipt-tickets` endpoint.
- [ ] Support pagination (page, limit).
- [ ] Support filtering by:
    - `status` (`DRAFT`, `CONFIRMED`, `VOIDED`)
    - `creatorId` (Người lập
)
    - Date range (`fromDate`, `toDate`)
- [ ] Support searching by Ticket ID.

### US-007: Confirm Goods Receipt (Stock & Audit)
**Description:** As a Warehouse Staff member, I want to confirm the finalized receipt so that the items are officially added to the
 warehouse stock.

**Acceptance Criteria:**
- [ ] Create `POST /api/v1/receipt-tickets/{id}/confirm` endpoint.
- [ ] Transition ticket status from `DRAFT` to `CONFIRMED`.
- [ ] **Data Integrity:** Once confirmed, the ticket and
 its lines become immutable for standard users.
- [ ] **Admin Override:** Admins can edit or delete confirmed tickets; if done, the system must calculate differences and update stock accordingly.
- [ ] **Stock Update:** For each line item, create/update records in the `Stock Balance` table.
- [ ] **Audit Trail:** Generate `StockMovement` records (Insert-Only) for every stock change, linking back to the Ticket ID and recording the user who performed the action.
- [ ] Wrap the status change, stock update, and audit log creation in a single database transaction.

## 5
. Functional Requirements
- **FR-1:** Ticket IDs must follow the pattern `PN-YYYYMM-N` where `N` is an increment resetting monthly.
- **FR-2:** The `UnitConversionEngine` must be a "Pure" domain service with zero dependencies on NestJS or Prisma.

- **FR-3:** All math operations must use `decimal.js` to avoid floating-point errors.
- **FR-4:** APIs must return standardized error objects via a global `ExceptionFilter`.
- **FR-5:** Numeric data must be serialized as `String` in JSON outputs to
 protect precision on the Flutter client.

## 6. Non-Goals (Out of Scope)
- Printing PDF receipts (deferred to Epic 6).
- Handling supplier/vendor information (deferred to Phase 2).
- Batch uploading receipt lines via Excel (deferred to Phase 2).

## 
7. Technical Considerations
- **Architecture:** Must follow the 4-layer Clean Architecture (Domain -> Application -> Infrastructure -> Presentation).
- **Concurrency:** Use Prisma transactions for the confirmation process to ensure atomicity.
- **Caching:** Consider caching Product Category rules in Redis to speed up the Unit Engine calculations.

- **Paths:**
  - Repositories: `src/infrastructure/database/repositories/receipt-ticket.repository.ts`
  - Use Cases: `src/application/use-cases/receipt-tickets/`
  - Controllers: `src/presentation/controllers/receipt-ticket
.controller.ts`

## 8. Success Metrics
- 100% accuracy in stock balance updates after confirmation.
- API response time < 300ms for line item additions.
- Audit trail correctly captures every single inventory change.

## 9. Open Questions
- Should
 we support "Draft Deletion" (deleting the entire ticket) or only "Voiding" once confirmed? (Current scope assumes hard delete for drafts is okay).
- Is there a maximum number of lines allowed per receipt?
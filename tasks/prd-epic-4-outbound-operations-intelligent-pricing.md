# PRD: Epic 4 - Outbound Operations & Intelligent Pricing

## 1. Introduction/Overview
This
 epic focuses on the "Outbound" side of the WMS, specifically the creation and management of Goods Issue (Export) tickets. A key highlight is the **Intelligent Pricing Engine**, which automatically calculates line item prices based on a hierarchical discount system (Product-specific > General > Base) while ensuring stock integrity through
 strict validation.

## 2. Goals
- Enable efficient creation of Goods Issue tickets with automated pricing.
- Prevent negative stock by validating inventory levels before ticket confirmation.
- Implement a hierarchical pricing engine for automated customer discounts.
- Maintain a clear audit trail of all outbound stock movements.
- Support manual price overrides for
 authorized Admin users.

## 3. Quality Gates
These commands must pass for every user story:
- `npm run lint` - ESLint and Prettier check.
- `npx tsc --noEmit` - TypeScript type checking.

## 4. User Stories

### US-4
01: Define Issue Ticket Domain Model
**Description:** As a developer, I want to define the `IssueTicket` and `IssueTicketLine` entities and repository interfaces so that the core domain logic is decoupled from the database.

**Acceptance Criteria:**
- [ ] Create `IssueTicket` and `IssueTicket
Line` entities in `src/domain/entities/`.
- [ ] Include fields: `code`, `customerId`, `totalAmount`, `status` (DRAFT, COMPLETED, CANCELLED), and `lines`.
- [ ] Define `IIssueTicketRepository` in `src/domain
/contracts/`.
- [ ] Use `decimal.js` for all numeric/monetary fields as per `GEMINI.md`.

### US-402: Implement Intelligent Pricing Engine
**Description:** As a system, I want to calculate the unit price for a line item based on the customer's discount
 hierarchy so that pricing is consistent and automated.

**Acceptance Criteria:**
- [ ] Create `PricingEngineService` in `src/domain/services/`.
- [ ] Implement hierarchy: 1. Product-specific discount > 2. Category/General discount > 3. Base product price.
-
 [ ] Service should take `customerId`, `productId`, and `basePrice` as input and return the `finalPrice`.
- [ ] Logic must be "Pure" and have no external dependencies.

### US-403: Auto-numbering for Export Tickets
**Description:** As a user, I want
 export tickets to have a standardized code format `PX-yyyymm-n` so that they are easily identifiable and sorted.

**Acceptance Criteria:**
- [ ] Implement a service/utility to generate codes in the format `PX-YYYYMM-N`.
- [ ] The sequence `N` must reset
 to 1 at the start of every calendar month.
- [ ] Ensure the generation is thread-safe/transaction-safe (no duplicate codes).

### US-404: Goods Issue Creation Use Case
**Description:** As a warehouse staff, I want to create a Goods Issue ticket so that I can prepare
 items for shipment.

**Acceptance Criteria:**
- [ ] Implement `CreateIssueTicketUseCase` in `src/application/use-cases/`.
- [ ] Automatically apply Intelligent Pricing to all lines.
- [ ] Validate that requested quantity exists in `Inventory` for each line.
- [
 ] Throw a domain exception if stock is insufficient (no negative stock).

### US-405: Admin Manual Price Override
**Description:** As an Admin, I want to manually override the calculated price on a ticket line so that I can handle special cases or errors.

**Acceptance Criteria:**
- [ ] Update
 `IssueTicketLine` to support an `isOverride` flag and `originalPrice`.
- [ ] The Use Case must check user permissions (RBAC) before allowing an override.
- [ ] Log the override event for auditing purposes.

### US-406: Issue Ticket Persistence (Prisma)

**Description:** As a system, I want to persist Issue Tickets to the PostgreSQL database so that data is durable and queryable.

**Acceptance Criteria:**
- [ ] Implement `PrismaIssueTicketRepository` in `src/infrastructure/database/repositories/`.
- [ ] Update `schema.prisma
` with `issue_tickets` and `issue_ticket_lines` tables (using `snake_case` mapping).
- [ ] Use Prisma transactions to ensure Ticket and Lines are saved together.

### US-407: Stock Movement Integration
**Description:** As a system, I want to record
 stock movements and update inventory when a ticket is completed so that stock levels remain accurate.

**Acceptance Criteria:**
- [ ] When an `IssueTicket` status moves to `COMPLETED`, decrease `Inventory` levels.
- [ ] Create `StockMovement` records with type `OUTBOUND` and reference the
 `IssueTicket`.
- [ ] Ensure atomicity via database transactions.

### US-408: Goods Issue API Controller
**Description:** As a frontend developer, I want to access outbound operations via a REST API so that I can build the user interface.

**Acceptance Criteria:**
- [
 ] Create `IssueTicketController` in `src/presentation/controllers/`.
- [ ] Implement endpoints: `POST /api/v1/issue-tickets` and `GET /api/v1/issue-tickets/:id`.
- [ ] Fully document endpoints using `@nestjs/swagger` (Summary
, DTOs, Responses).
- [ ] Ensure `NUMERIC` fields are serialized as `String` in JSON.

## 5. Functional Requirements
- **FR-1:** The system MUST prevent any transaction that results in negative inventory.
- **FR-2:** Pricing logic MUST prioritize the most
 specific discount available for a customer/product pair.
- **FR-3:** Ticket codes MUST follow the format `PX-YYYYMM-N` and reset monthly.
- **FR-4:** All monetary calculations MUST use `decimal.js` to avoid floating-point errors.
- **FR-5:** Soft
 deletes should be applied to tickets if requested, but stock movements remain for audit.

## 6. Non-Goals
- Real-time shipping carrier integration (FedEx/UPS/etc.).
- Picking/Packing mobile app workflow (Handheld logic).
- Advanced routing or multi-warehouse transfer (Single
 warehouse focus for this epic).

## 7. Technical Considerations
- **Concurrency:** High-volume outbound operations might cause race conditions on inventory; use database-level locks or Prisma's atomic operations where necessary.
- **Clean Architecture:** Ensure `src/domain` remains pure with zero NestJS/Prisma dependencies.

- **Caching:** Consider caching resolved permissions and pricing rules in Redis for performance.

## 8. Success Metrics
- 100% of export tickets generated with correct `PX-` formatting.
- Zero instances of negative stock recorded in the database.
- Pricing engine correctly applies product-specific overrides in
 100% of test cases.

## 9. Open Questions
- Should "DRAFT" tickets reserve stock (reduce available stock but not on-hand)? (Currently: Validation happens at creation/completion).
- Do we need to support "Partial Shipping" where a ticket is only partially completed? (
Assumed: One ticket = One shipment for now).
# PRD: Customer Management & Discount Policy Module

## 1. Introduction
/Overview
The Customer Management and Discount Policy module is a core component of the WMS Backend. It handles the master data for customers and defines the commercial rules for pricing through flexible discount policies. These policies allow for both general customer-wide discounts and specific per-product overrides, ensuring that the sales team can generate accurate
 `IssueTicket` transactions with automated pricing.

## 2. Goals
- Provide a centralized registry for Customer master data.
- Enable flexible Discount Policy configurations (General vs. Per-Product overrides).
- Ensure data integrity by preventing modifications to policies already in use.
- Track policy application history for auditing
 and reporting purposes.
- Maintain absolute numeric precision (`NUMERIC(15,3)`) for all financial calculations.

## 3. Quality Gates & Workflow
These gates must pass for every user story to be considered complete:
- **Linting:** `npm run lint` - Ensures code follows project
 style and standards.
- **Type Safety:** `npx tsc --noEmit` - Verifies type safety across the application.
- **Auto-Commit Mandate:** The agent MUST perform a git commit immediately after successfully validating each individual task/user story.

## 4. User Stories

### US-001: Customer CRUD Management
**Description:** As an Admin, I want to manage the Customer registry so that I can maintain a clean list of commercial partners.
**Acceptance Criteria:**
- [ ] Implement CRUD endpoints for `Customer` (Create, Read, Update, Delete).
- [ ]
 Fields required: `code` (unique), `name`, `address`, `phone`, `email`, `note`.
- [ ] Validate that `code` is unique and follows project naming conventions.
- [ ] Standardized JSON responses with `statusCode` and `data`.

### US-002: Discount Policy Definition & Configuration
**Description:** As a Manager, I want to define discount policies for customers so that pricing can be automated.
**Acceptance Criteria:**
- [ ] Implement Create/Read endpoints for `DiscountPolicy`.
- [ ] Support `discountType` (`NONE`, `PERCENT`, `AMOUNT`).

- [ ] Support `isAppliedAll` (General discount) and `productIds` for specific overrides.
- [ ] `discountValue` must be stored as `NUMERIC(15,3)` in DB and serialized as `String` in API.
- [ ] A policy is linked to
 exactly one `Customer`.

### US-003: Soft Delete and Usage Tracking for Policies
**Description:** As a System, I want to track if a policy is used and prevent its modification to maintain historical integrity.
**Acceptance Criteria:**
- [ ] Add `deletedAt` (Date/
Null) to `DiscountPolicy` table for soft deletes.
- [ ] Add `isUsed` (Boolean) flag to `DiscountPolicy` (defaults to `false`).
- [ ] When an `IssueTicket` is confirmed using a policy, the system must set `isUsed = true` for that policy.

- [ ] Prevent `Update` operations on any `DiscountPolicy` where `isUsed` is `true`.
- [ ] `Delete` operation must perform a soft delete (setting `deletedAt`) instead of a hard delete.

## 5. Functional Requirements
- **FR-1:** Every `Customer` must have a unique system-generated or user-provided `code`.
- **FR-2:** `DiscountPolicy` must support both percentage-based and fixed-amount discounts.
- **FR-3:** System must block any attempt to edit a policy that has already been linked to a confirmed `IssueTicket`.
- **FR-4:** API must return all numeric fields (quantities, values) as `String` to prevent floating-point truncation in the Flutter client.
- **FR-5:** Policies are permanent (no start/end dates required) but can be soft-deleted.

## 6. Non-Goals (Out of Scope)
- Export/Import functionality for Customers or
 Policies (Excel/CSV).
- Time-bound/Scheduled policies (Seasonal promotions).
- Customer groups or credit limit management.
- Complex multi-warehouse policy overrides.

## 7. Technical Considerations
- **Layering:** Ensure `DiscountPolicy` logic stays in `src/domain` and 
`src/application`, while Prisma implementation stays in `src/infrastructure`.
- **Serialization:** Use `class-transformer` to ensure `Decimal` types are stringified in JSON responses.
- **Concurrency:** Use database transactions when confirming tickets and updating the `isUsed` flag on policies.

## 8. Success Metrics
- 100% accuracy in discount calculations compared to manual Excel sheets.
- Zero floating-point rounding errors in the database.
- Successful audit trace from `IssueTicketLine` back to the specific `DiscountPolicy`.

## 9. Open Questions
- Should we allow a customer to have multiple active policies, or just one primary policy? (Assumption: One primary policy for now).
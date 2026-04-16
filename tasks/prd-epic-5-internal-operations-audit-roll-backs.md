# PRD: Epic 5 - Internal Operations & Audit Roll-backs


## 1. Introduction/Overview

This feature implements critical internal warehouse operations, specifically the ability to split products (
commonized for all types, including rolls, boxes, etc.) and perform administrative roll-backs (voiding) of
 confirmed transactions. It ensures full traceability via product lineage and transaction history while providing flexibility for administrators to correct errors even if stock
 levels are affected.

## 2. Goals

- Implement a generic "Split" operation supporting multiple child products and
 unit conversions.
- Establish a permanent product lineage using a `parentProductId` field.
- Provide administrative "Void" capabilities
 for Receipt, Issue, and Split tickets.
- Ensure data integrity through backend warnings when voiding actions would result in
 negative stock.
- Maintain high code quality through standardized linting and type-checking.

## 3. Quality
 Gates
These commands must pass for every user story:

- `npm run lint` - Ensures code style and best practices.
- `npx tsc --noEmit` - Verifies type safety across the project.

## 4.
 User Stories

### US-501: Extend Product Model for Lineage
**Description:** As a developer,
 I want to add a `parentProductId` field to the Product model so that I can track the origin of split products
.

**Acceptance Criteria:**
- [ ] Update `prisma/schema.prisma` to add `parent_
product_id` to the `Product` table (self-relation).
- [ ] Update the Domain `Product
` entity to include `parentProductId`.
- [ ] Update Prisma repositories to handle the new field.
- [
 ] Ensure `parentProductId` is included in Product API responses.

### US-502: Create Split Ticket
 (Draft)
**Description:** As a warehouse staff, I want to create a Split Ticket header so that I can
 begin the process of breaking down a master product.

**Acceptance Criteria:**
- [ ] POST `/api/
v1/split-tickets` endpoint created.
- [ ] Generates ticket number using pattern `ST-yyyy
MM-n`.
- [ ] Initial status is `DRAFT`.
- [ ] Validates `sourceProductId
` and `warehouseId`.

### US-503: Add Split Ticket Lines with Unit Conversion
**Description
:** As a warehouse staff, I want to add multiple child lines to a split ticket, specifying quantities and potential unit conversions
.

**Acceptance Criteria:**
- [ ] POST `/api/v1/split-tickets/{id}/
lines` endpoint created.
- [ ] Supports adding multiple lines in a single request (Child A, B, ...,
 Remaining).
- [ ] Allows specifying a different `productId` for child lines (for grade changes) or same `productId
` with different units/dimensions.
- [ ] Logic supports both simple quantity deduction (100 -> 4
0+30+30) and unit conversion (1 Box -> 10 Packs).
- [ ]
 Math performed using `decimal.js`.

### US-504: Confirm Split Ticket
**Description:** As
 a warehouse staff, I want to confirm a split ticket to execute the stock movement and generate child product records.

**
Acceptance Criteria:**
- [ ] POST `/api/v1/split-tickets/{id}/confirm` endpoint
 created.
- [ ] Deducts quantity from source stock.
- [ ] Creates/Updates stock entries for all
 child lines.
- [ ] Automatically links new product entries to the source via `parentProductId`.
- [ ]
 Creates `StockMovement` records for all changes.
- [ ] Status changes to `CONFIRMED`.

###
 US-505: Void Receipt Ticket with Warning
**Description:** As an admin, I want to void a
 confirmed Receipt Ticket to correct errors, receiving a warning if stock becomes negative.

**Acceptance Criteria:**
- [
 ] POST `/api/v1/receipt-tickets/{id}/void` endpoint created.
- [ ] Re
verses the stock increase from the original receipt.
- [ ] Backend checks current stock levels: if `current - original
_received < 0`, the API response includes a `warning: "Action results in negative stock"` field but proceeds
 with the void.
- [ ] Updates status to `VOIDED`.
- [ ] Creates compensating `StockMovement
` records.

### US-506: Void Issue Ticket with Warning
**Description:** As an admin,
 I want to void a confirmed Issue Ticket to return items to stock.

**Acceptance Criteria:**
- [ ] POST
 `/api/v1/issue-tickets/{id}/void` endpoint created.
- [ ] Reverses the
 stock deduction (adds stock back).
- [ ] Backend returns a warning if the reversal creates an inconsistency (though usually
 safe).
- [ ] Updates status to `VOIDED`.
- [ ] Creates compensating `StockMovement` records
.

### US-507: Void Split Ticket with Warning
**Description:** As an admin, I want
 to void a confirmed Split Ticket to undo a product breakdown.

**Acceptance Criteria:**
- [ ] POST `/
api/v1/split-tickets/{id}/void` endpoint created.
- [ ] Reverses the entire
 split: restores source product quantity and removes/deducts child product quantities.
- [ ] Backend returns a warning
 if child stock has already been consumed (resulting in negative child stock).
- [ ] Updates status to `VOIDED
`.

### US-508: Product Lineage Inquiry API
**Description:** As a user, I want
 to view the lineage of a product to see its parent and children.

**Acceptance Criteria:**
- [ ]
 GET `/api/v1/products/{id}/lineage` endpoint created.
- [ ] Returns parent product
 details and a list of child products created from this one.
- [ ] References the `SplitTicket` that created
 the link.

## 5. Functional Requirements

- **FR-1**: Split Ticket Numbering: Must follow
 `ST-yyyyMM-XXXX` where XXXX is a monthly increment.
- **FR-2**: Generic
 Splitting: Logic must not be hardcoded to "Rolls". It must handle any product using its base unit or
 defined unit conversions.
- **FR-3**: Warning Format: All Void APIs must return a standardized JSON structure:
 `{ success: boolean, data: object, warnings: string[] }`.
- **FR-4**: Precision:
 All quantity calculations must use `NUMERIC(15,3)` in the database and `decimal.js` in
 the application layer.

## 6. Non-Goals
- Automatic cascading voids (e.g., voiding
 a receipt will NOT automatically void splits that used that stock).
- Hard block on negative stock for Admins (Admin
 Override is the intended behavior).
- Physical label printing (out of scope for this Epic).

## 7.
 Technical Considerations

- Use Prisma transactions for the Confirm and Void operations to ensure atomicity.
- Ensure the `Stock
Movement` entity captures the "Void" reason and original ticket reference.
- NestJS `ExceptionFilter` or a
 custom Interceptor may be needed to inject warnings into the success response.

## 8. Success Metrics
- 
100% of internal operations (Split, Void) are tracked in `StockMovement`.
- Product lineage is
 navigable through at least 3 levels of splits.
- Zero floating-point errors in quantity math.

## 
9. Open Questions
- Should the `parentProductId` be restricted to only products created via Split, or can it
 be used for "Bundling" in the future? (Currently restricted to Split).
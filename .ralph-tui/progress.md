# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

* **Unit Conversion Engine:** Pure domain service (`UnitConversionEngine`) for calculating metrics (area, weight) based on units and product dimensions.
* **Decimal Precision:** All numeric fields use `Decimal` from `decimal.js` for calculations and `NUMERIC(15,3)` in PostgreSQL.
* **API Serialization:** Decimals are serialized as `String` in DTOs (using `.toFixed(3)`) to prevent floating-point issues on clients.
* **Clean Architecture:** Use cases orchestration between repositories (Infrastructure) and Domain services.

---

## [2026-04-09] - US-306
- Implemented `GET /api/v1/receipt-tickets` endpoint with filtering and pagination.
- Renamed `CANCELLED` status to `VOIDED` in `TransactionStatus` enum and Prisma schema to match PRD requirements.
- Supported searching by Ticket ID (`ticketNo`) and filtering by `status`, `creatorId`, and date range.
- Files changed:
  - `src/domain/enums/index.ts`
  - `prisma/schema.prisma`
  - `src/presentation/controllers/receipt-tickets.controller.ts`
  - `src/application/use-cases/receipt-tickets/list-receipt-tickets.use-case.ts`
  - `src/infrastructure/database/repositories/receipt-ticket.repository.ts`
- **Learnings:**
  - **Standardized Terminology:** Always align codebase enums with PRD terminology (`VOIDED` vs `CANCELLED`) to ensure API documentation and user expectations match.
  - **Case-Insensitive Search:** Use `mode: "insensitive"` in Prisma for search filters on business IDs (like `ticketNo`).
---

## [2026-04-09] - US-302
- Implemented `POST /api/v1/receipt-tickets/{id}/lines` endpoint.
- Improved `UnitConversionEngine` to handle multiple unit types (`roll`, `m2`, `kg`).
- Added fallback logic in `AddReceiptLineUseCase` to use `product.length` if `lengthM` is not provided.
- Added comprehensive unit tests for `UnitConversionEngine` and `AddReceiptLineUseCase`.
- Files changed:
  - `src/domain/services/unit-conversion-engine.ts`
  - `src/domain/services/unit-conversion-engine.spec.ts`
  - `src/application/use-cases/receipt-tickets/add-receipt-line.use-case.ts`
  - `src/application/use-cases/receipt-tickets/add-receipt-line.use-case.spec.ts`
  - `src/presentation/controllers/receipt-tickets.controller.ts`
  - `src/presentation/dtos/receipt-tickets/add-receipt-line-request.dto.ts`
  - `src/presentation/dtos/receipt-tickets/receipt-ticket-line-response.dto.ts`
  - `src/infrastructure/database/repositories/receipt-ticket.repository.ts`
- **Learnings:**
  - **Unit Engine Robustness:** The engine needs to be aware of the `unitCode` to correctly calculate `areaM2` and `weightKg`. For `m2` units, area is simply the quantity. For `kg` units, area is derived from weight using the conversion factor.
  - **Fallback Logic:** Always consider product default dimensions when explicit dimensions are missing in transaction lines.
---

## [2026-04-09] - US-306 (Refinement)
- Added `GetReceiptTicketsResponseDto` to provide explicit Swagger documentation for the paginated response.
- Updated `ReceiptTicketsController.findAll` to use the new response DTO.
- Verified all acceptance criteria: pagination, filtering (status, creatorId, date range), and search (Ticket ID).
- Files changed:
  - `src/presentation/dtos/receipt-tickets/get-receipt-tickets-response.dto.ts`
  - `src/presentation/controllers/receipt-tickets.controller.ts`
- **Learnings:**
  - **Swagger Schema Completeness:** Using dedicated DTOs for paginated responses (including `data` and `meta`) significantly improves API discoverability and frontend integration.
---

## [2026-04-09] - US-303
- Implemented PATCH /api/v1/receipt-tickets/{id}/lines/{lineId} endpoint.
- Added UpdateReceiptLineUseCase to handle line updates with automatic metric recalculation.
- Implemented findLineById and updateLine in ReceiptTicketRepository.
- Enforced DRAFT-only updates for non-admin users.
- Files changed:
  - src/application/dtos/update-receipt-line.dto.ts
  - src/presentation/dtos/receipt-tickets/update-receipt-line-request.dto.ts
  - src/application/use-cases/receipt-tickets/update-receipt-line.use-case.ts
  - src/application/use-cases/receipt-tickets/update-receipt-line.use-case.spec.ts
  - src/domain/contracts/receipt-ticket.repository.interface.ts
  - src/infrastructure/database/repositories/receipt-ticket.repository.ts
  - src/infrastructure/receipt-tickets/receipt-tickets.module.ts
  - src/presentation/controllers/receipt-tickets.controller.ts
- **Learnings:**
  - **Conditional Logic in PATCH:** When updating entities that depend on related data (like product dimensions), ensure that changing a foreign key (productId) also triggers a refresh of the dependent default values if they aren't explicitly provided in the update payload.
  - **Role-Based Authorization in Use Cases:** For business rules that depend on roles (e.g., "unless admin"), passing a boolean flag like 'isAdmin' to the use case keeps the domain logic decoupled from specific authentication frameworks while still enforcing the requirement.
---

## [2026-04-09] - US-304
- Implemented `DELETE /api/v1/receipt-tickets/{id}/lines/{lineId}` endpoint.
- Added `DeleteReceiptLineUseCase` to handle line item deletion with authorization and validation.
- Implemented `deleteLine` method in `ReceiptTicketRepository` for hard deletion.
- Enforced `DRAFT`-only deletion for non-admin users.
- Verified that the line item belongs to the specified ticket before deletion.
- Files changed:
  - `src/domain/contracts/receipt-ticket.repository.interface.ts`
  - `src/infrastructure/database/repositories/receipt-ticket.repository.ts`
  - `src/application/use-cases/receipt-tickets/delete-receipt-line.use-case.ts`
  - `src/application/use-cases/receipt-tickets/delete-receipt-line.use-case.spec.ts`
  - `src/infrastructure/receipt-tickets/receipt-tickets.module.ts`
  - `src/presentation/controllers/receipt-tickets.controller.ts`
- **Learnings:**
  - **Hard vs. Soft Delete:** Line items in draft transactions are typically hard-deleted as they don't have historical significance yet and it keeps the database clean.
  - **Ownership Validation:** Always verify that a sub-resource (like a line item) belongs to the parent resource (like a ticket) when performing operations via composite URLs to prevent unauthorized cross-resource access.
---

## [2026-04-09] - US-305
- Implemented GET /api/v1/receipt-tickets/{id} endpoint to retrieve receipt details.
- Added findWithLines method to ReceiptTicketRepository to fetch receipt along with its line items.
- Created GetReceiptTicketUseCase to calculate totals (total m2, total kg, total rolls) using stored metrics in line items.
- Updated ReceiptTicketResponseDto and created ReceiptTicketDetailsResponseDto to ensure proper serialization of numeric fields as strings and include creatorId.
- Files changed:
  - src/domain/contracts/receipt-ticket.repository.interface.ts
  - src/infrastructure/database/repositories/receipt-ticket.repository.ts
  - src/application/use-cases/receipt-tickets/get-receipt-ticket.use-case.ts
  - src/application/use-cases/receipt-tickets/get-receipt-ticket.use-case.spec.ts
  - src/presentation/dtos/receipt-ticket-response.dto.ts
  - src/presentation/dtos/receipt-tickets/receipt-ticket-details-response.dto.ts
  - src/infrastructure/receipt-tickets/receipt-tickets.module.ts
  - src/presentation/controllers/receipt-tickets.controller.ts
  - src/presentation/controllers/receipt-tickets.controller.spec.ts
- **Learnings:**
  - **Standardized Terminology:** Standardized on including both createdBy (database field) and creatorId (API requested field) in DTOs to ensure compatibility and meet specific requirements.
  - **Metric Summation:** Calculation of totals for Goods Receipt can be done by summing up pre-calculated metrics (areaM2, weightKg) stored in line items, while total rolls depends on filtering lines by "roll" unitCode.
---

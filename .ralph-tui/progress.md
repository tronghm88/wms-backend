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

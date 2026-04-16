# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Decimal Precision:** All numeric metrics (weight, quantity, length, volume) and currency fields use `Decimal` from `decimal.js` in Domain/Application layers and `NUMERIC(15,3)` in PostgreSQL. They are serialized as `String` in API JSON responses.
- **Strict Clean Architecture:** Layers are organized as Domain, Application, Infrastructure, and Presentation. Domain logic is pure; Infrastructure handles persistence (Prisma).
- **Self-Relation Lineage:** For tracking origin/lineage (like split products), use a self-referential relation in Prisma (`parentProductId` pointing to `id`).

---

## 2026-04-16 - US-001
- Extended Product model to support lineage tracking for split products.
- Files changed:
    - `prisma/schema.prisma`: Added `parent_product_id` and self-relation.
    - `src/domain/entities/product.entity.ts`: Added `parentProductId`.
    - `src/infrastructure/database/repositories/product.repository.ts`: Updated mapping, create, and update methods.
    - `src/presentation/dtos/products/product-response.dto.ts`: Added `parentProductId` to response.
    - `src/presentation/dtos/products/create-product.dto.ts` & `update-product.dto.ts`: Added `parentProductId` to input DTOs.
    - `src/application/use-cases/products/*.ts`: Updated all product use cases (create, update, get, list) and their spec files.
- **Learnings:**
    - Prisma self-relations require explicit `@relation` names when multiple relations exist between the same models or to avoid ambiguity in self-references.
    - When adding fields to the Domain entity, remember to update all Use Case request/response interfaces and their mappings in the repository.
---

## 2026-04-16 - US-002
- Implemented Create Split Ticket (Draft) header.
- Files changed:
    - `src/domain/contracts/split-ticket.repository.interface.ts`: Added `getLastTicketNo` and `SPLIT_TICKET_REPOSITORY` constant.
    - `src/infrastructure/database/repositories/split-ticket.repository.ts`: Implemented repository with Prisma.
    - `src/presentation/dtos/split-tickets/create-split-ticket.dto.ts`: Created input DTO with warehouseId validation.
    - `src/presentation/dtos/split-tickets/split-ticket-response.dto.ts`: Created response DTO with entity mapping.
    - `src/application/use-cases/split-tickets/create-split-ticket.use-case.ts`: Implemented logic for ticket generation and validation.
    - `src/application/use-cases/split-tickets/create-split-ticket.use-case.spec.ts`: Added unit tests.
    - `src/presentation/controllers/split-tickets.controller.ts`: Created POST /api/v1/split-tickets endpoint.
    - `src/infrastructure/split-tickets/split-tickets.module.ts`: Created module for split tickets.
    - `src/app.module.ts`: Registered SplitTicketsModule.
- **Learnings:**
    - Prisma's `UpdateInput` vs `UncheckedUpdateInput`: Use `UncheckedUpdateInput` when you need to update foreign key fields using IDs directly rather than nested objects.
    - Standardized ticket number generation (ST-yyyyMM-n) involves finding the last ticket of the month and incrementing its sequence.
    - Even in single-warehouse systems, maintaining placeholders for `warehouseId` in DTOs can satisfy requirement specifications while keeping the schema lean.
---

## 2026-04-16 - US-003
- Implemented Add Split Ticket Lines with Unit Conversion logic.
- Files changed:
    - `src/domain/entities/split-ticket.entity.ts`: Added `lines` property and mapping.
    - `src/domain/contracts/split-ticket.repository.interface.ts`: Added `addLines` and `deleteLines` methods.
    - `src/infrastructure/database/repositories/split-ticket.repository.ts`: Implemented line persistence and mapping with `include: { lines: true }`.
    - `src/presentation/dtos/split-tickets/add-split-ticket-lines.dto.ts`: Created DTO for multiple line input.
    - `src/presentation/dtos/split-tickets/split-ticket-response.dto.ts`: Updated to include nested lines in response.
    - `src/application/use-cases/split-tickets/add-split-ticket-lines.use-case.ts`: Implemented core logic including unit conversion and quantity validation.
    - `src/presentation/controllers/split-tickets.controller.ts`: Added `POST /api/v1/split-tickets/:id/lines` endpoint.
    - `src/infrastructure/split-tickets/split-tickets.module.ts`: Registered new use case and imported `UnitConversionsModule`.
- **Learnings:**
    - Unit conversion in split tickets involves validating target quantities against the source quantity. Since factors are stored as `1 fromUnit = factor * toUnit`, conversion back to source unit requires division or multiplication depending on which unit is the "from" unit in the database.
    - When working with nested relations in Prisma, ensure `include` is used in repository find/update methods to populate the entities correctly.
    - Always verify import paths in use cases when DTOs are located in the presentation layer to avoid "Module not found" errors during type checking.
---

## 2026-04-16 - US-004
- Implemented Confirm Split Ticket with Stock Movement logic.
- Files changed:
    - `src/application/use-cases/split-tickets/confirm-split-ticket.use-case.ts`: Implemented core logic for stock deduction, child stock updates, product lineage linkage, and stock movement creation.
    - `src/presentation/controllers/split-tickets.controller.ts`: Added `POST /api/v1/split-tickets/:id/confirm` endpoint.
    - `src/infrastructure/split-tickets/split-tickets.module.ts`: Registered `ConfirmSplitTicketUseCase` and imported `StockModule`.
- **Learnings:**
    - Stock movements (SPLIT_IN/SPLIT_OUT) require tracking `qtyAfter` to maintain a consistent audit trail. This is calculated by first updating the inventory and then recording the result.
    - Product lineage (parentProductId) is automatically linked during the confirmation phase specifically for products marked as "new" in the split ticket lines.
    - Reusing existing `InventoryRepository.updateQuantity` simplifies the implementation by abstracting the upsert/increment logic while still allowing the use case to calculate the resulting `qtyAfter`.
---

## 2026-04-16 - US-005
- Implemented Void Receipt Ticket functionality with negative stock warnings.
- Added `void` method to `IReceiptTicketRepository` and implemented it in `ReceiptTicketRepository` with transaction support.
- Created `VoidReceiptTicketUseCase` and `VoidReceiptTicketResponseDto`.
- Added `POST /api/v1/receipt-tickets/:id/void` endpoint and `RECEIPTS_VOID` permission.
- **Files changed:**
  - `src/domain/contracts/receipt-ticket.repository.interface.ts`
  - `src/domain/exceptions/receipt-ticket.exceptions.ts`
  - `src/domain/constants/permissions.constant.ts`
  - `src/infrastructure/database/repositories/receipt-ticket.repository.ts`
  - `src/infrastructure/receipt-tickets/receipt-tickets.module.ts`
  - `src/application/use-cases/receipt-tickets/void-receipt-ticket.use-case.ts`
  - `src/presentation/controllers/receipt-tickets.controller.ts`
  - `src/presentation/dtos/receipt-tickets/void-receipt-ticket-response.dto.ts`
- **Learnings:**
  - **Patterns discovered:** All Void APIs should return a standardized JSON structure `{ success: true, data: object, warnings: string[] }` as per PRD-5 requirements. This allows the backend to proceed with sensitive operations while alerting the user to potential data inconsistencies like negative stock.
  - **Gotchas encountered:** When using Prisma's `$transaction`, always ensure all data needed for business logic (like product codes for warnings) is included in the initial fetch to avoid extra queries within the transaction block.
---

## 2026-04-16 - US-006
- Implemented Void Issue Ticket functionality with stock reversal and audit trail.
- Added `void` method to `IIssueTicketRepository` and implemented it in `PrismaIssueTicketRepository` with transaction support.
- Created `VoidIssueTicketUseCase` and `VoidIssueTicketResponseDto`.
- Added `POST /api/v1/issue-tickets/:id/void` endpoint and `ISSUES_VOID` permission.
- Renamed `IssueTicketStatus.CANCELLED` to `VOIDED` for consistency with requirements and database schema.
- **Files changed:**
  - `src/domain/constants/permissions.constant.ts`
  - `src/domain/contracts/issue-ticket.repository.interface.ts`
  - `src/domain/enums/index.ts`
  - `src/infrastructure/database/repositories/prisma-issue-ticket.repository.ts`
  - `src/application/use-cases/issue-tickets/void-issue-ticket.use-case.ts`
  - `src/application/use-cases/issue-tickets/void-issue-ticket.use-case.spec.ts`
  - `src/presentation/dtos/issue-tickets/void-issue-ticket-response.dto.ts`
  - `src/presentation/controllers/issue-tickets.controller.ts`
  - `src/infrastructure/issue-tickets/issue-tickets.module.ts`
- **Learnings:**
  - **Status Mapping:** Standardizing status names (e.g., `VOIDED` instead of `CANCELLED`) across Domain, DB, and Requirement specs improves code readability and reduces mapping confusion.
  - **Keyword Gotchas:** When a method name is a reserved keyword in JavaScript/TypeScript (like `void`), use bracket notation (e.g., `repository["void"]`) in test mocks to avoid `unbound-method` lint errors and scoping issues.
  - **Reversal Logic:** Voiding an Issue Ticket reverses the `OUT` movement with an `IN` movement, effectively adding stock back to the inventory. Even when adding stock back, consistency warnings should be checked for audit completeness.
---

## 2026-04-16 - US-007
- Implemented Void Split Ticket with stock reversal and consumption warnings.
- Files changed:
    - `src/presentation/dtos/split-tickets/void-split-ticket-response.dto.ts`: New DTO for void response with warnings.
    - `src/application/use-cases/split-tickets/void-split-ticket.use-case.ts`: Implemented logic for stock reversal, warning generation, and clearing product lineage.
    - `src/presentation/controllers/split-tickets.controller.ts`: Added `POST /api/v1/split-tickets/:id/void` endpoint.
    - `src/infrastructure/split-tickets/split-tickets.module.ts`: Registered new use case and injected `ProductRepository`.
- **Learnings:**
    - **Warning Logic:** When voiding transactions that "produced" stock (like Split), check if the produced stock is still available. If `currentInventory < producedQty`, it means stock was consumed, which should trigger a warning even if the operation proceeds.
    - **Undoing Lineage:** To fully "undo" a split, the `parentProductId` link on child products should be cleared (`undefined`) if they were newly linked during the split.
    - **Use Case vs Repository Logic:** While `IssueTicket` void logic is in the repository, `SplitTicket` follows a pattern where complex multi-entity logic (Stock + Product + Ticket) is kept in the Use Case layer to remain consistent with its confirmation logic.
---

## 2026-04-16 - US-008
- Implemented Product Lineage Inquiry API (parent and children tracking).
- Files changed:
    - `src/domain/entities/product-lineage.entity.ts`: New domain entity for lineage structure.
    - `src/domain/contracts/product.repository.interface.ts`: Added `findLineage` method.
    - `src/infrastructure/database/repositories/product.repository.ts`: Implemented `findLineage` with Prisma nested includes.
    - `src/presentation/dtos/products/product-lineage-response.dto.ts`: New DTO for lineage response with `SplitTicket` references.
    - `src/application/use-cases/products/get-product-lineage.use-case.ts`: Implemented lineage logic.
    - `src/presentation/controllers/products.controller.ts`: Added `GET /api/v1/products/:id/lineage` endpoint.
    - `src/infrastructure/products/products.module.ts`: Registered new use case.
    - `src/application/use-cases/products/get-product.use-case.spec.ts` & `list-products.use-case.spec.ts`: Updated repository mocks.
- **Learnings:**
    - **Self-Relation Queries:** Prisma allows deep fetching of self-relations. To get the `SplitTicket` that created a link, we must look at `splitTargets` on the product, which points to the `SplitTicketLine` records where the product was a target.
    - **DTO Patterns:** For complex nested responses (like lineage), using constructors in DTOs to map from domain entities ensures that the presentation layer logic is encapsulated and the Use Case remains focused on orchestration.
    - **Mocking Strategy:** When adding methods to a shared interface like `IProductRepository`, updating mocks in existing spec files is necessary to maintain type safety across the project, even for unrelated tests.
---

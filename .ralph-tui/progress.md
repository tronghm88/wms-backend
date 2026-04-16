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

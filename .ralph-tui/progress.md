# Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

### NestJS DI with Interfaces
When injecting an interface using a token (e.g., `@Inject(REPOSITORY_TOKEN)`), use `import type` for the interface type in the constructor to satisfy `isolatedModules` and `emitDecoratorMetadata` constraints.
```typescript
import { Inject, Injectable } from "@nestjs/common";
import { REPOSITORY_TOKEN } from "../contracts/repository.interface";
import type { IRepository } from "../contracts/repository.interface";

@Injectable()
export class SomeUseCase {
  constructor(
    @Inject(REPOSITORY_TOKEN)
    private readonly repository: IRepository,
  ) {}
}
```

---

## 2026-04-17 - US-601-2
- Created `InventoryController` with `GET /api/v1/inventory/snapshot` endpoint.
- Implemented `InventorySnapshotResponseDto` enforcing string-serialization for `NUMERIC(15,3)` fields using `.toFixed(3)`.
- Updated `InventoryRepository.findAllActiveStock()` and `GetInventorySnapshotUseCase` to include product dimensions (length, width, height).
- Registered `InventoryController` in `StockModule`.
- Added unit tests for `InventoryController`.
- **Learnings:**
  - Standardized response DTOs are essential for consistent string serialization of decimals across the API, preventing frontend precision issues.
  - Adding Swagger decorators (`@ApiProperty`) in DTOs ensures that the frontend team can automatically generate accurate API clients.
  - Using simple constructor-based mapping in DTOs is a memory-efficient way to transform bulk data for the presentation layer in NestJS.

---

## 2026-04-17 - US-601-1
- Implemented `GetInventorySnapshotUseCase` and `InventoryRepository.findAllActiveStock()`.
- Added `InventorySnapshotItem` to `IInventoryRepository` interface.
- Registered the new use case in `StockModule`.
- Added unit tests for the use case.
- **Learnings:**
  - Optimized Prisma queries should use `select` instead of `include` for bulk retrieval to minimize data transfer and memory overhead.
  - When using NestJS DI with interfaces, use `import type` for the interface type in the constructor to satisfy `isolatedModules` and `emitDecoratorMetadata` constraints.
  - Consistent serialization of `NUMERIC(15,3)` fields as strings is crucial for data integrity across the system.

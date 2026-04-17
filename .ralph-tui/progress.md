# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.
## Codebase Patterns (Study These First)

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

## 2026-04-17 - US-601-1
- Implemented `GetInventorySnapshotUseCase` and `InventoryRepository.findAllActiveStock()`.
- Added `InventorySnapshotItem` to `IInventoryRepository` interface.
- Registered the new use case in `StockModule`.
- Added unit tests for the use case.
- **Learnings:**
  - Optimized Prisma queries should use `select` instead of `include` for bulk retrieval to minimize data transfer and memory overhead.
  - When using NestJS DI with interfaces, use `import type` for the interface type in the constructor to satisfy `isolatedModules` and `emitDecoratorMetadata` constraints.
  - Consistent serialization of `NUMERIC(15,3)` fields as strings is crucial for data integrity across the system.
---


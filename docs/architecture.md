---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-30'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/wireframes/wireframe-index.md
  - _bmad-output/customer-questions.md
  - _bmad-output/brainstorming/brainstorming-session-2026-03-28-1348.md
  - _bmad-output/estimate-v2.md
workflowType: 'architecture'
project_name: 'wms'
user_name: 'Windy'
date: '2026-03-30T15:35:00+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Auth & RBAC:** Admin control over user access, featuring role-based UI visibility and secured JWT-based authentication.
- **Master Data:** Complex product structures supporting multi-dimensional metric equivalents (rolls, kg, m²) alongside multi-tiered customer discount policies.
- **Inventory Transactions:** Robust dual-state transaction lifecycles (Draft → Confirmed) across Goods Receipts, Issues, and Split Tickets.
- **Computation Tools:** Two automated core engines (Unit Conversion, Pricing Evaluation) performing real-time cross calculations during transaction drafting.
- **Audit & Analytics:** Strict append-only tracking of all stock movements and backend-mediated generation of high-fidelity Excel/PDF documents.

**Non-Functional Requirements:**
- **Performance:** Sub-500ms API response rates; UI must support smooth rendering of high-volume data grids (10,000+ rows).
- **Data Integrity:** Zero-tolerance rounding policies mandating `NUMERIC(15,3)` mapping from the database straight through to API DTOs.
- **Security:** Standard TLS/1.2 encryption, secure local token storage (`flutter_secure_storage`), and bcrypt hashing.
- **Resilience:** Uncompromising "always-online" paradigm preventing partial local commits or out-of-sync states.
- **Ergonomics:** Highly optimized, keyboard-navigable UI meant for high-speed "warehouse-floor" data entry tasks.

**Scale & Complexity:**
- Primary domain: Desktop Client (Flutter) + RESTful Backend (NestJS)
- Complexity level: Medium-High
- Estimated architectural components: ~14 core entities, 6 domain modules, and 2 specialized computation engines.

### Technical Constraints & Dependencies

- Absolute separation of client and server logic: Flutter acts exclusively as the presentation layer, relying heavily on NestJS for business validation and file generation.
- All PDF and Excel rendering must be executed gracefully by the backend using Puppeteer and ExcelJS, transmitting only ready binaries to the client.
- The UI must align loosely with provided Figma/Wireframe blueprints but leverage Material 3 components for delivery speed.

### Cross-Cutting Concerns Identified

- **Unit Conversion Engine:** Requires robust, globally accessible domain service capable of translating real-time dimensions across completely disparate UI forms and business flows.
- **Pricing Evaluation Strategy:** Needs unified resolution algorithms seamlessly assessing specific product permutations against global customer policies.
- **Immutable Auditing:** Demands a structured event-publishing or interceptor module decoupled from feature-specific saving logic to record standard `StockMovement` tracks.
- **RBAC Verification:** Must implement granular verification guarding both NestJS API routes and Flutter Widget trees uniformly.
- **Precision Mathematics Coverage:** Floating point data types are forbidden; architecture must establish utility safeguards converting numeric strings safely.

## Starter Template Evaluation (Backend Focus)

### Primary Technology Domain

Backend REST API (NestJS) implementing strict Clean Architecture patterns to isolate computation engines (Pricing & Unit Conversion), supported by centralized containerization (Docker).

### Starter Options Considered

1. **Third-party Open Source Boilerplates (e.g., `clean-nest-prisma-pg`):** Cung cấp sẵn folder structure Clean Architecture + Prisma + Redis. Tuy nhiên thường đi kèm code opinionated (chứa sẵn module User chung chung, hoặc kèm theo BullMQ không cần thiết), tốn công dọn dẹp và dễ gây conflict với requirement đặc thù của dự án.
2. **Official NestJS CLI (`@nestjs/cli`):** Tạo ra một môi trường nguyên sơ, sau đó chúng ta tự cấu trúc lại thư mục `src/` theo quy chuẩn Clean Architecture.

### Selected Starter: Official NestJS CLI + Custom Clean Architecture

**Rationale for Selection:**
Để đạt được cảnh giới Clean Architecture chuẩn xác nhất, việc dùng Official CLI làm base là bắt buộc. Nhờ đó ta sẽ giữ được phần `Domain` (chứa lõi Unit/Pricing) hoàn toàn thuần TypeScript 100%, không bị phụ thuộc vào metadata của thư viện ngoài. Prisma và Redis sẽ được đẩy hoàn toàn ra lớp ngoài cùng (`Infrastructure`). Môi trường local sẽ được dựng bằng Docker Compose để chạy PostgreSQL và Redis.

**Initialization Command:**

```bash
# 1. Initialize the NestJS API Backend
npx @nestjs/cli new wms-backend --package-manager npm

# 2. Add Core Backend Dependencies & Caching
cd wms-backend
npm install @nestjs/swagger prisma @prisma/client 
npm install @nestjs/passport passport-jwt bcrypt exceljs puppeteer
npm install cache-manager cache-manager-redis-yet ioredis

# 3. Initialize Prisma & Prepare Docker
npx prisma init
touch docker-compose.yml
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Node.js + TypeScript strict mode, đảm bảo Type-Safety tuyệt đối khi truyền Data Transfer Objects (DTOs) qua các boundaries.

**Build Tooling & Infrastructure:**
- NestJS Webpack/TSC configuration chuẩn.
- `docker-compose.yml` sẽ thiết lập PostgreSQL 16 và Redis isolated container.

**Testing Framework:**
- `Jest` được cấu hình sẵn. Hỗ trợ test thẳng các file Use Case ở lớp Application mà không cần phải boot toàn bộ NestJS App Context.

**Code Organization (Clean Architecture Matrix):**
Sẽ thay thế cấu trúc `module > controller > service` mặc định của Nest bằng cấu trúc phân lớp đồng tâm:
- `src/domain/`: Chứa Entities, Value Objects và Interface quy chuẩn. Mọi logic tính toán % chiết khấu và quy đổi đơn vị ở đây. **Không dependency framework ngoài.**
- `src/application/`: Chứa Use Cases (ví dụ: `CreateGoodsIssueUseCase`) để điều phối domain logic.
- `src/infrastructure/`: PrismaRepositories cho DB DB, RedisClient cho Caching, JwtStrategy cho Auth Auth.
- `src/presentation/`: Chứa NestJS Controllers, DTOs (`class-validator`), Exception Filters.

**Development Experience:**
- Caching được đấu nối qua interface chuẩn tĩnh của Nest (`@nestjs/cache-manager`), dễ dàng cấu hình RedisStore cho Production.

**Note:** Project initialization using this command should be the first implementation story for the Backend track.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database schema structure enforcing the `NUMERIC(15,3)` requirement across all transactional components.
- Clean Architecture boundaries definitions separating the pure computation engines (Domain Logic) from NestJS framework decorators (Infrastructure/Presentation).

**Important Decisions (Shape Architecture):**
- Security structure: Stateless JWT integration within Passport alongside custom RBAC NestJS Guards.
- Caching policy: Determining exactly what data is cached in Redis versus what must be evaluated strictly real-time from the database.

**Deferred Decisions (Post-MVP):**
- Specific cloud hosting providers (AWS vs DigitalOcean) and auto-scaling mechanics (Current plan uses Docker on a single robust instance).
- Cross-warehouse scaling implications (Architected exclusively for 1 warehouse per the Phase 1 scope).

### Data Architecture

- **Database Engine:** PostgreSQL (Version 16)
  - *Rationale:* Native robustness for `NUMERIC` math types, robust ACID guarantees necessary for critical financial and inventory state changes.
- **ORM:** Prisma (Version 7.x)
  - *Rationale:* Type-safe bridging to the database; acts as the primary adapter in our Infrastructure layer.
- **Caching Strategy:** Selective Master-Data Caching via Redis
  - *Rationale:* Redis will aggressively cache read-heavy configurations (e.g., Category structures, global Unit Conversions constants) with explicit invalidation triggers on mutation. **Inventory Stock levels will explicitly NOT be cached** to ensure zero race conditions on `Negative-Stock` evaluation.

### Authentication & Security

- **Authentication Method:** JWT + Refresh Token via `@nestjs/passport`
  - *Rationale:* Industry standard; backend verifies tokens securely. 
  - *Session Resilience:* Access Tokens are short-lived. Refresh Tokens are hashed and maintained within Redis (Key: `session:refresh_token:{userId}`) prioritizing zero-latency cache-invalidation to instantly neutralize compromised or blocked user accounts without waiting for token expiration.
- **Authorization Pattern:** Custom `@RequirePermissions()` Decorator & Middleware
  - *Rationale:* NestJS Middleware/JwtStrategy will decode the JWT and lookup `session:user_data:{userId}` from Redis to map full user context into `req.user`. This ensures a cache-hit bypasses the Database 99% of the time. If it's a miss, it loads from Postgres, evaluates, and sets the Redis session.
- **RBAC Data Strategy:** Source-Code Defined Roles + Nullable DB Overrides
  - *Rationale:* Roles and default permissions are mapped purely in Source Code to prevent data integrity issues. The PostgreSQL `User` schema natively leverages a `custom_permissions String[]?` field. If `null`, backend falls back to Role defaults. If present (`[]` or populated), it acts as an absolute permission override.

### API & Communication Patterns

- **Design Pattern:** Pure RESTful API
  - *Rationale:* Predictable, natively supported by Flutter's Dio client, avoiding the payload-parsing overhead of GraphQL for a system with fixed screen boundaries.
- **Error Handling Standards:** Standardized Error DTO wrappers
  - *Rationale:* A global `AllExceptionsFilter` in NestJS will catch unhandled errors and format them uniformly (e.g., `statusCode`, `message`, `errorCode`), ensuring Dio interceptors in Flutter can gracefully handle and display business logic rejections (like "Out of Stock").
- **Documentation:** Swagger/OpenAPI (mapped via `@nestjs/swagger`)
  - *Rationale:* Enables optimal parallel development; Flutter teams can synthesize their DTO data models against the Swagger contract before the backend endpoint logic implementation is even finished.

### Frontend (Client) Architecture

- **Tech Stack:** Flutter Desktop (Version 3.x)
  - *Rationale:* Single codebase, high-performance desktop-grade rendering via Skia/Impeller, resolving the Windows native output requirement.
- **State Management:** Riverpod
  - *Rationale:* Scalable DI capability, strictly controlling REST API reads/mutations linked to the heavy `pluto_grid` table renders.

### Infrastructure & Deployment

- **Containerization Strategy:** Docker + Docker Compose
  - *Rationale:* Ensures complete environmental parity. Developers will run NestJS v11, PostgreSQL 16, and Redis identically locally and on production.
- **Deployment Platform:** Containerized Cloud VM (e.g., Linux VPS)
  - *Rationale:* For Phase 1 scope, maximum performance on a singular robust VM behind a reverse proxy (Nginx or Traefik) radically reduces DevOps complexity while supporting thousands of simultaneous requests.

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold Docker environment (PostgreSQL 16 + Redis clusters).
2. Construct NextJS Clean Architecture base skeleton (`Domain`, `App`, `Infra`, `Pres`).
3. Establish the `NUMERIC(15,3)` Prisma schemas and execute migrations.
4. Implement the Unit Conversion & Pricing Engines purely as zero-dependency Domain Use-Cases.
5. Wire up JWT Passport Auth + Swagger.
6. Progress onto specific Module Endpoints (Products → Receipts → Issues).

**Cross-Component Dependencies:**
- The `@Roles()` decorator relies entirely on the JWT payload structure; therefore the Auth Module must precede any Master Data implementation.
- Flutter's presentation UI heavily relies on the integrity of Swagger outputs; ensuring API DTO schemas are strictly decorated via `class-validator` becomes the primary bottleneck preventing client integration.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 key areas where AI agents could make diverging choices resulting in system failures: Database to API serialization mismatches, Float/String numeric conversions, File naming collisions across Dart and TypeScript, cross-boundary imports, and Error Handling wrappers.

### Naming Patterns

**Database Naming Conventions:**
- **Prisma Schema Models:** Must be `PascalCase` and singular (e.g., `model GoodsReceipt`).
- **Database Tables mapping:** Must be explicitly mapped to `snake_case` and plural using `@@map` (e.g., `@@map("goods_receipts")`).
- **Columns:** Must explicitly map to `snake_case` using `@map` in Prisma (e.g., `customer_id String @map("customer_id")`).

**API Naming Conventions:**
- **REST Endpoints:** Must be `kebab-case` and plural (e.g., `/api/v1/price-policies`).
- **Query/Params:** Must be `camelCase` (e.g., `?customerId=123`).

**Code Naming Conventions:**
- **NestJS Files:** Must use `kebab-case` with dot suffixes indicating component type (e.g., `create-goods-issue.use-case.ts`, `goods-receipt.controller.ts`).
- **NestJS Classes:** `PascalCase` with intent suffix (e.g., `CreateGoodsIssueUseCase`).
- **Flutter Files:** Must use strict `snake_case` (standard Dart practice) (e.g., `goods_issue_screen.dart`).
- **Flutter Classes:** `PascalCase` (e.g., `GoodsIssueScreen`).

### Structure Patterns

**Project Organization:**
- **NestJS Clean Architecture Boundary Isolation:** `src/domain` MUST NOT import anything from `src/infrastructure` or `@nestjs/common`. If an AI agent uses a NestJS or Prisma decorator inside `domain/`, it is a critical violation.
- **Flutter Feature Slices:** Must adopt Feature-First architecture: `lib/features/{feature_name}` containing `presentation`, `providers`, and `domain` folders.

**File Structure Patterns:**
- NestJS DTOs (Data Transfer Objects) must exist purely in `src/presentation/dtos` and must have strict `class-validator` decorators. Domain layer does not know about DTOs.

### Format Patterns

**API Response Formats:**
- **Success Responses:** Must be wrapped in a strict standard JSON format: 
  `{ "statusCode": 200, "data": { ... }, "meta": { "totalItems": 10 } }`
- **Error Responses:** Must follow standard structure with an explicit App Code for UI translation: 
  `{ "statusCode": 400, "errorCode": "NEGATIVE_STOCK", "message": "Cannot issue more stock than available." }`

**Data Exchange Formats:**
- **Precision Numeric (CRITICAL):** All Prisma `NUMERIC(15,3)` fields MUST be serialized as `String` in the API JSON responses to prevent Javascript/Dart floating point truncation natively. Agents must extract them as strings in Flutter and parse them directly into custom `Decimal` precision objects.
- **Dates:** Always ISO 8601 UTC strings (e.g., `2026-03-30T10:00:00Z`). Local timezone translation only happens within the Flutter UI layer.

### Process Patterns

**Error Handling Patterns:**
- **Backend:** Agents must throw domain-specific custom exceptions extending the standard `Error` type natively inside `UseCases`. These are mapped to HTTP responses by a global NestJS `ExceptionFilter`.
- **Flutter:** Dio interceptors must unilaterally catch 4xx/5xx errors, parse the `errorCode` from the payload, and pass the translated Exception to the Riverpod `AsyncValue.error` handler.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `@@map` and `@map` in Prisma schemas unconditionally.
- Serialize exact numbers and monetary fields as strings over HTTP.
- Maintain absolute zero-framework-dependencies in the NestJS `src/domain/` directory.

### Pattern Examples

**Good Examples:**
✅ `model PricePolicy { id String @id } @@map("price_policies")`
✅ `const finalPrice: string = result.total.toString()` (Sending safely to API)

**Anti-Patterns:**
❌ `GET /api/v1/pricePolicy` (Camelcase REST route)
❌ `import { Injectable } from '@nestjs/common'` inside `src/domain/use-cases`
❌ Parsing large warehouse metrics using `double.parse(value)` in Flutter (risks losing 0.001 precision).

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
wms-root/
├── wms-backend/                         # NestJS API Repo
│   ├── package.json
│   ├── docker-compose.yml               # PostgreSQL 16 & Redis Services
│   ├── prisma/
│   │   └── schema.prisma                # DB Schema & @@map directives
│   ├── test/                            # E2E test suites
│   └── src/
│       ├── app.module.ts                # App compilation root
│       ├── main.ts                      # App Bootstrap & Swagger Init
│       ├── domain/                      # 🔥 LAYER 1: Core Business (No Frameworks)
│       │   ├── entities/                # PricePolicy, GoodsIssue, Product
│       │   ├── exceptions/              # NegativeStockException, ValidationError
│       │   └── contracts/               # Repository Interfaces (IProductRepository)
│       ├── application/                 # ⚙️ LAYER 2: Application Use-Cases
│       │   ├── use-cases/
│       │   │   ├── auth/                # LoginUseCase
│       │   │   ├── master-data/         # CalculateUnitRatioUseCase
│       │   │   ├── transactions/        # ConfirmGoodsIssueUseCase
│       │   │   └── inventory/           # AdjustStockUseCase
│       │   └── dtos/                    # Internal app-boundary DTOs
│       ├── infrastructure/              # 🔌 LAYER 3: Outside World Adapters
│       │   ├── database/                # PrismaRepositoryImpl
│       │   ├── cache/                   # RedisCacheService
│       │   ├── auth/                    # JwtStrategy, PasswordHasher
│       │   └── services/                # ExcelJS & Puppeteer Report Service
│       └── presentation/                # 🌐 LAYER 4: HTTP Interface
│           ├── controllers/             # GoodsReceiptController, AuthController
│           ├── dtos/                    # class-validator API definitions
│           ├── guards/                  # RbacGuard, JwtAuthGuard
│           └── filters/                 # GlobalExceptionFilter (RFC 7807)
│
└── wms_client/                          # Flutter Desktop Repo
    ├── pubspec.yaml
    ├── windows/                         # Windows Native Build Runner
    ├── macos/                           # MacOS Native Build Runner
    └── lib/
        ├── main.dart
        ├── core/                        # Shared Application Core
        │   ├── network/                 # Dio Client, Error Interceptors
        │   ├── theme/                   # Material 3 Design Tokens
        │   ├── security/                # flutter_secure_storage impl
        │   └── types/                   # String-to-Decimal parsers
        └── features/                    # Feature-First Slices
            ├── auth/                    # M1: Login UI & Session
            ├── master_data/             # M2: Products & Discount Config
            ├── transactions/            # M3/M4/M5: Receipts, Issues, Splits
            │   ├── domain/              # Models & Entities
            │   ├── presentation/        # S20 Goods Issue Form, S25 Split Form
            │   └── providers/           # Riverpod state controllers
            ├── inventory/               # M6: Stock Grid & Adjustments
            └── reports/                 # M7: Dashboard & Export Buttons
```

### Architectural Boundaries

**API Boundaries:**
- The Backend strictly communicates via REST JSON (`/api/v1/*`).
- All incoming requests hit the `presentation/` layer which merely transforms HTTP contexts into raw data objects, passing them down into `application/use-cases`.
- **CRITICAL:** `domain/` rules CANNOT call the database directly. The `application/` layer bridges communication by passing the `IInventoryRepository` contract into Domain evaluation engines.

**Component Boundaries:**
- In Flutter, `features` must be completely independent. `features/transactions` cannot import UI widgets from `features/master_data`. 
- All shared UI pieces (Common buttons, generic AppBars) must reside centrally in `lib/core/widgets`.

**Service Boundaries:**
- Redis caching logic is strictly hidden inside `infrastructure/cache`. The `application/` layer simply interrogates a generic `ICacheService` for data without knowing whether it acts through Redis or in-memory arrays.

**Data Boundaries:**
- The Prisma client is NEVER allowed to leak outside of `infrastructure/database`. Use-cases must receive cleanly-mapped JavaScript objects, absolutely never raw Prisma Models holding ORM methods.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- **M1: Auth & RBAC:**
  - Logic: `wms-backend/src/application/use-cases/auth/`
  - UI: `wms_client/lib/features/auth/presentation/`
- **M2: Catalog & Pricing:**
  - Logic: `wms-backend/src/application/use-cases/master-data/`
  - Persistence: `wms-backend/src/infrastructure/database/repositories/product.repository.ts`
- **M3/M4/M5: Inventory Transactions (Issue, Receipt, Split):**
  - Logic: `wms-backend/src/application/use-cases/transactions/`
  - UI (Highly Complex): `wms_client/lib/features/transactions/presentation/`
- **M7: Exporting Reports:**
  - Logic Component: `wms-backend/src/infrastructure/services/excel.service.ts`

**Cross-Cutting Concerns:**
- **Unit Conversion Engine:** Lives in `wms-backend/src/domain/entities/unit-converter.ts`.
- **JWT Decoding Array:** `wms-backend/src/presentation/guards/rbac.guard.ts`.
- **Decimal Safe-Parsing:** `wms_client/lib/core/types/decimal_formatter.dart`.

### Integration Points

**Internal Communication:**
- NestJS Use-Cases seamlessly communicate asynchronously by deliberately throwing Exceptions designed within the `domain`, allowing standard rollback of Postgres transactions universally.

**External Integrations:**
- No third-party API integrations exist per MVP (e.g., MISA accounting endpoints are out-of-scope for Phase 1). Only purely local Docker-native interactions occur.

**Data Flow Sequence Example (GET Inventory):**
1. Flutter Grid asks for Stock `(GET /api/v1/inventory)`.
2. NestJS `InventoryController` (Presentation) calls `GetInventoryUseCase` (Application).
3. `GetInventoryUseCase` invokes `IInventoryRepository.findAll()`.
4. `PrismaInventoryRepository` (Infrastructure) runs actual Postgres SQL -> Maps Prisma Model into pure internal Domain Entity.
5. Controller wraps data in `ResponseDto` -> Network -> Flutter parses JSON strings natively protecting `.Decimal` fidelity.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- NestJS v11, Prisma v7, PostgreSQL 16, and Redis operate synchronously perfectly.
- Flutter Desktop 3.x consuming REST APIs via Dio effectively bridges the client-server gap.

**Pattern Consistency:**
- Clean Architecture rules directly support the strict isolation required for the complex Unit Conversion and Pricing engines. The engines sit in pure JS/TS space unpolluted by Prisma models.

**Structure Alignment:**
- The dual-repo structure (`wms-backend` & `wms_client`) physically enforces the decoupling of UI state management from DB entity logic.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- All Epics (M1 through M7) are fully mapped to specific directories in both Flutter and NestJS.
- Complex workflows (like M5 Split Issue) have designated `use-cases` to handle their multi-step transactions safely.

**Functional Requirements Coverage:**
- Floating point inaccuracies (the most common WMS bug) are fundamentally blocked by forcing `NUMERIC(15,3)` at the DB layer and `String` serialization at the Network layer.

**Non-Functional Requirements Coverage:**
- Auditability is protected by routing all DB inserts through centralized Prisma Repositories.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Technology versions are pinned and initialization commands are prepared in the document.

**Structure Completeness:**
- AI agents now possess a 1-to-1 blueprint of exactly where to put DTOs, Controllers, Domain Logic, and UI Widgets.

**Pattern Completeness:**
- Clear anti-patterns have been established prohibiting cross-layer imports and framework-coupling in the deepest logic layers.

### Gap Analysis Results

- **Minor Gap (Development Workflow):** Automated code-generation of Flutter DTO models from NestJS Swagger JSON is not explicitly defined. *Resolution:* For MVP, AI agents will manually write corresponding Dart `freezed` classes for explicit control, shifting to auto-generation post-MVP.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified (Float precision, Desktop OS)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined

**✅ Implementation Patterns**
- [x] Naming conventions established (snake_case DB, PascalCase Dart)
- [x] Structure boundaries strictly defined
- [x] Number/Date parsing rules specified

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH based on validation results and the rigid structural guardrails put in place against AI-hallucinated anti-patterns.

**Key Strengths:**
- Math precision guarantee through all architectural layers.
- Total domain independence; core algorithms can be unit-tested seamlessly without spinning up databases or HTTP servers.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Zero usage of NestJS or Prisma decorators inside `src/domain/`.
- Serialize all quantities and prices natively to Strings in API Payloads.

**First Implementation Priority:**
Initiate the repository generation using the `npx @nestjs/cli new` commands listed in step 3. Install core dependencies and configure `docker-compose.yml`.

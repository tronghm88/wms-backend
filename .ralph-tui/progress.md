# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **Dependency Injection**: Use string constants for repository interfaces (e.g., `USER_REPOSITORY`, `UNIT_REPOSITORY`) to decouple Application layer from Infrastructure.
- **Clean Architecture Layers**:
    - **Domain**: Entities and repository interfaces (contracts).
    - **Application**: Use cases with `execute` method and `Request`/`Response` interfaces.
    - **Infrastructure**: Prisma repositories, NestJS modules.
    - **Presentation**: Controllers, DTOs with `class-validator` and `nestjs/swagger`.
- **Data Mapping**: Repositories use a private `mapToDomain` method to convert Prisma models to Domain Entities.
- **RBAC**: Use `RequirePermissions(Permissions.XXX)` decorator on controller methods to enforce permissions.
- **Exceptions**: Custom domain exceptions extending a base exception (e.g., `AuthException`, `UnitException`, `CategoryException`) with an `errorCode`.
- **Global Error Handling**: `GlobalExceptionFilter` maps domain exceptions (by `errorCode`) to proper HTTP status codes.

## 2026-04-04 - US-001
- Implemented `POST /api/v1/units` endpoint for creating units.
- Added `UNITS_MANAGE` permission to `Permissions` constant.
- Created `UnitEntity`, `IUnitRepository`, and `UNIT_REPOSITORY` constant in Domain.
- Created `CreateUnitUseCase` in Application.
- Implemented `UnitRepository` with Prisma in Infrastructure.
- Created `UnitsModule` and registered it in `AppModule`.
- Created `UnitsController` and `CreateUnitDto` in Presentation.
- Added unit tests for `CreateUnitUseCase`.
- Verified with `npm run lint` and `npx tsc --noEmit`.

- **Learnings:**
  - `Unit` table uses `code` as its primary key (String).
  - RBAC is enforced via `RequirePermissions` decorator which checks against `user.permissions` or `user.role === 'ADMIN'`.

## 2026-04-04 - US-005
- What was implemented:
  - Categories management module foundation.
  - POST /api/v1/categories endpoint with Swagger documentation and RBAC (CATEGORIES_MANAGE).
  - CreateCategoryUseCase with uniqueness check for manual code.
  - CategoryRepository implementation with Prisma.
  - Custom CategoryExceptions for better error handling.
  - Improved GlobalExceptionFilter to automatically map domain exceptions to proper HTTP statuses.
- Files changed:
  - src/domain/constants/permissions.constant.ts
  - src/domain/contracts/category.repository.interface.ts
  - src/domain/exceptions/category.exceptions.ts
  - src/infrastructure/database/repositories/category.repository.ts
  - src/application/use-cases/categories/create-category.use-case.ts
  - src/application/use-cases/categories/create-category.use-case.spec.ts
  - src/presentation/dtos/categories/create-category.dto.ts
  - src/presentation/controllers/categories.controller.ts
  - src/infrastructure/categories/categories.module.ts
  - src/app.module.ts
  - src/presentation/filters/global-exception.filter.ts
  - src/application/use-cases/units/create-unit.use-case.spec.ts (lint fix)
- **Learnings:**
  - **Patterns discovered:** Domain exceptions follow a pattern of having an `errorCode` property which can be leveraged in a global filter for uniform API error responses.
  - **Gotchas encountered:** Existing spec files had some linting issues (unbound-method and any-usage) that needed fixing to pass CI gates.
---

## 2026-04-04 - US-002
- Implemented GET /api/v1/units endpoint.
- Created GetUnitsUseCase with unit tests.
- Updated UnitsController and UnitsModule.
- Files changed:
  - src/application/use-cases/units/get-units.use-case.ts
  - src/application/use-cases/units/get-units.use-case.spec.ts
  - src/infrastructure/units/units.module.ts
  - src/presentation/controllers/units.controller.ts
- **Learnings:**
  - **Patterns discovered:** Standard Clean Architecture pattern: Controller -> Use Case -> Repository (via Interface).
  - **Gotchas encountered:** Importance of using "import type" for interfaces in NestJS use cases to satisfy linter and compiler (isolatedModules).
  - Use of /* eslint-disable @typescript-eslint/unbound-method */ in test files when testing with jest-mocked repositories.
---

## 2026-04-04 - US-003
- What was implemented:
  - GET /api/v1/units/:code endpoint to retrieve a specific unit by its unique code.
  - GetUnitByCodeUseCase with unit tests (success and not found cases).
  - UnitNotFoundException in domain exceptions.
  - Swagger documentation for the new endpoint including 404 response.
- Files changed:
  - src/domain/exceptions/unit.exceptions.ts
  - src/application/use-cases/units/get-unit-by-code.use-case.ts
  - src/application/use-cases/units/get-unit-by-code.use-case.spec.ts
  - src/infrastructure/units/units.module.ts
  - src/presentation/controllers/units.controller.ts
- **Learnings:**
  - **Patterns discovered:** Consistent with existing GetUnitsUseCase, but with added error handling for non-existent resources.
  - **Gotchas encountered:** Ensure "import type" is used for injected interfaces to satisfy `isolatedModules`.
  - Consolidating imports in controllers after multiple manual edits is necessary to prevent duplication and maintain code cleanliness.
---

## 2026-04-04 - US-004
- What was implemented:
  - DELETE /api/v1/units/:code endpoint to remove a unit by its unique code.
  - DeleteUnitUseCase with unit tests (success, not found, and in-use cases).
  - UnitInUseException in domain exceptions to handle foreign key constraint violations.
  - Swagger documentation for the new endpoint including 204 (No Content) and 400 (Bad Request for in-use) responses.
  - Unit tests for both the Use Case and the Controller.
- Files changed:
  - src/domain/exceptions/unit.exceptions.ts
  - src/application/use-cases/units/delete-unit.use-case.ts
  - src/application/use-cases/units/delete-unit.use-case.spec.ts
  - src/infrastructure/units/units.module.ts
  - src/presentation/controllers/units.controller.ts
  - src/presentation/controllers/units.controller.spec.ts
- **Learnings:**
  - **Patterns discovered:** Prisma P2003 error code (Foreign key constraint failed on the field) should be caught and re-thrown as a domain-specific `InUseException` to provide clear feedback to the API client.
  - **Gotchas encountered:** When using `@Inject` with a constructor parameter, TypeScript requires using `import type` for the interface if `emitDecoratorMetadata` and `isolatedModules` are enabled, to prevent runtime crashes/compilation errors.
  - Handling `unknown` error types in `catch` blocks with type guards (`(error as { code: string }).code === "P2003"`) is required to satisfy `typescript-eslint/no-unsafe-member-access`.
---

## 2026-04-04 - US-006
- What was implemented:
  - PATCH /api/v1/categories/:id endpoint to update an existing category.
  - UpdateCategoryUseCase with uniqueness check for manual code (if changed).
  - UpdateCategoryDto with optional fields and Swagger documentation.
  - CategoryNotFoundException for handling missing categories during update.
  - Unit tests for UpdateCategoryUseCase covering success, not found, and conflict scenarios.
- Files changed:
  - src/application/use-cases/categories/update-category.use-case.ts
  - src/application/use-cases/categories/update-category.use-case.spec.ts
  - src/infrastructure/categories/categories.module.ts
  - src/presentation/dtos/categories/update-category.dto.ts
  - src/presentation/controllers/categories.controller.ts
  - src/presentation/controllers/units.controller.spec.ts (lint fix)
- **Learnings:**
  - **Patterns discovered:** Conditional uniqueness checks in `execute` method: only query for existing code if the requested code is different from the current entity's code.
  - **Gotchas encountered:** When editing multiple files, ensure imports are consistent across related components (Module, Controller, Use Case).
  - Fixed an existing lint error in `units.controller.spec.ts` where `HttpStatus` was imported but unused, and accidentally removed `JwtAuthGuard` during the fix, which was quickly corrected.
---

## 2026-04-04 - US-007
- What was implemented:
  - GET /api/v1/categories endpoint to list all product categories.
  - GetCategoriesUseCase with unit tests.
  - Swagger documentation for the new endpoint.
  - CategoriesController unit tests (initial spec).
- Files changed:
  - src/application/use-cases/categories/get-categories.use-case.ts
  - src/application/use-cases/categories/get-categories.use-case.spec.ts
  - src/infrastructure/categories/categories.module.ts
  - src/presentation/controllers/categories.controller.ts
  - src/presentation/controllers/categories.controller.spec.ts
- **Learnings:**
  - **Patterns discovered:** Following the established Clean Architecture pattern for listing resources (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** Initial CategoriesController lacked a spec file, so it was created to ensure coverage for the new list endpoint.
  - Remembered to use `/* eslint-disable @typescript-eslint/unbound-method */` in new test files to satisfy project lint rules.
---

## 2026-04-04 - US-008
- What was implemented:
  - GET /api/v1/categories/:id endpoint to retrieve a specific category by its unique numeric ID.
  - GetCategoryByIdUseCase with unit tests (success and not found cases).
  - CategoryNotFoundException was already present in domain exceptions, but used for error handling.
  - Swagger documentation for the new endpoint including 404 response.
  - CategoriesController unit tests updated to cover the new endpoint.
- Files changed:
  - src/application/use-cases/categories/get-category-by-id.use-case.ts
  - src/application/use-cases/categories/get-category-by-id.use-case.spec.ts
  - src/infrastructure/categories/categories.module.ts
  - src/presentation/controllers/categories.controller.ts
  - src/presentation/controllers/categories.controller.spec.ts
- **Learnings:**
  - **Patterns discovered:** Reusing established Clean Architecture patterns for resource retrieval by ID (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** When using the `replace` tool, avoid using `...` as it is not allowed and will cause the tool to fail to find the string. Always provide the exact literal text for replacement.
---

## 2026-04-04 - US-009
- What was implemented:
  - DELETE /api/v1/categories/:id endpoint to remove a category.
  - DeleteCategoryUseCase with check for associated products and sizes.
  - CategoryHasProductsException and CategoryHasSizesException in domain exceptions.
  - Updated ICategoryRepository and CategoryRepository to include hasProducts and hasSizes methods.
  - Updated GlobalExceptionFilter to map "HAS_" error codes to 422 Unprocessable Entity.
  - Swagger documentation for the new endpoint including 204 (No Content), 404 (Not Found), and 422 (Unprocessable Entity) responses.
  - Unit tests for DeleteCategoryUseCase covering success, not found, and in-use scenarios.
- Files changed:
  - src/domain/contracts/category.repository.interface.ts
  - src/domain/exceptions/category.exceptions.ts
  - src/infrastructure/database/repositories/category.repository.ts
  - src/application/use-cases/categories/delete-category.use-case.ts
  - src/application/use-cases/categories/delete-category.use-case.spec.ts
  - src/infrastructure/categories/categories.module.ts
  - src/presentation/controllers/categories.controller.ts
  - src/presentation/filters/global-exception.filter.ts
- **Learnings:**
  - **Patterns discovered:** Using `repository["methodName"]` in tests to bypass `@typescript-eslint/unbound-method` when passing methods to `expect`.
  - **Gotchas encountered:** Ensure that `GlobalExceptionFilter` mapping is updated when adding new types of domain exceptions that should return specific HTTP status codes (like 422).
---

## 2026-04-04 - US-010
- What was implemented:
  - POST /api/v1/products endpoint for creating new products with manual code and physical metrics.
  - CreateProductUseCase with validation for unique code, existing category, and existing unit.
  - Decimal fields (basePrice, length, width, height) are handled with `decimal.js` and serialized with 3-decimal precision (`toFixed(3)`) in the API response.
  - PrismaProductRepository implementation.
  - ProductsModule registered in AppModule.
  - Unit tests for CreateProductUseCase covering success, code conflict, and missing dependencies (category/unit).
- Files changed:
  - src/domain/exceptions/product.exceptions.ts
  - src/domain/contracts/product.repository.interface.ts
  - src/application/use-cases/products/create-product.use-case.ts
  - src/infrastructure/database/repositories/product.repository.ts
  - src/presentation/dtos/products/create-product.dto.ts
  - src/presentation/controllers/products.controller.ts
  - src/infrastructure/products/products.module.ts
  - src/app.module.ts
  - src/application/use-cases/products/create-product.use-case.spec.ts
- **Learnings:**
  - **Patterns discovered:** Reused the domain exception mapping pattern in `GlobalExceptionFilter` (automatic 409/404/422/400 mapping based on error code suffix).
  - **Gotchas encountered:** `Decimal.toString()` trims trailing zeros, so `toFixed(3)` must be used to strictly adhere to the `NUMERIC(15,3)` precision requirement in API responses.
---

## 2026-04-04 - US-011
- What was implemented:
  - PATCH /api/v1/products/:id endpoint to update an existing product.
  - UpdateProductUseCase with checks for unique code (if changed), existing category, and existing unit.
  - UpdateProductDto with optional fields and Swagger documentation.
  - ProductNotFoundException handling for missing products during update.
  - Unit tests for UpdateProductUseCase covering success, not found, and conflict scenarios.
- Files changed:
  - src/application/use-cases/products/update-product.use-case.ts
  - src/application/use-cases/products/update-product.use-case.spec.ts
  - src/presentation/dtos/products/update-product.dto.ts
  - src/presentation/controllers/products.controller.ts
  - src/infrastructure/products/products.module.ts
- **Learnings:**
  - **Patterns discovered:** Reusing established Clean Architecture patterns for resource updates with conditional uniqueness and existence checks for related entities.
  - **Gotchas encountered:** Ensure `toFixed(3)` is used for all `Decimal` fields in responses to maintain consistent precision. Fixed lint errors related to unused imports and missing `await` in tests.
---

## 2026-04-04 - US-012
- What was implemented:
  - GET /api/v1/products endpoint for listing products.
  - Included Category name in the product listing (joined via Prisma).
  - Updated ProductEntity to include categoryName as a required property.
  - Added PRODUCTS_VIEW, CATEGORIES_VIEW, UNITS_VIEW, CUSTOMERS_VIEW permissions and updated role-based access control.
  - Created ListProductsUseCase with formatted numeric fields (serialized as strings).
  - Created ProductResponseDto for Swagger documentation.
  - Updated ProductRepository to include Category relation in all methods.
  - Added unit tests for ListProductsUseCase and updated existing product use case tests to handle the new categoryName requirement.
- Files changed:
  - src/domain/entities/product.entity.ts
  - src/infrastructure/database/repositories/product.repository.ts
  - src/application/use-cases/products/list-products.use-case.ts
  - src/application/use-cases/products/list-products.use-case.spec.ts
  - src/application/use-cases/products/create-product.use-case.ts
  - src/application/use-cases/products/create-product.use-case.spec.ts
  - src/application/use-cases/products/update-product.use-case.ts
  - src/application/use-cases/products/update-product.use-case.spec.ts
  - src/presentation/controllers/products.controller.ts
  - src/presentation/dtos/products/product-response.dto.ts
  - src/infrastructure/products/products.module.ts
  - src/domain/constants/permissions.constant.ts
- **Learnings:**
  - **Prisma Includes:** When adding relations to Prisma queries, ensure the repository's `mapToDomain` method handles the joined data correctly and the Domain Entity is updated to reflect these fields if they are essential to the domain or presentation layers.
  - **Entity Consistency:** Making a property required in a Domain Entity requires updating all use cases that instantiate that entity, including their respective unit tests.
  - **API Precision:** Always follow the project mandate of serializing numeric fields as strings with specific precision (e.g., `.toFixed(3)`) to prevent floating-point issues in frontend clients.
  - **Permission Granularity:** Adding new `_VIEW` permissions alongside `_MANAGE` permissions provides better control over access, especially for read-only operations like listing.
---

## 2026-04-04 - US-013
- What was implemented:
  - GET /api/v1/products/:id endpoint to retrieve a specific product by its ID.
  - GetProductUseCase with unit tests (success and not found cases).
  - Swagger documentation for the new endpoint including 404 response.
  - Fixed lint errors in `list-products.use-case.spec.ts` by properly typing the repository mock.
- Files changed:
  - src/application/use-cases/products/get-product.use-case.ts
  - src/application/use-cases/products/get-product.use-case.spec.ts
  - src/application/use-cases/products/list-products.use-case.spec.ts
  - src/infrastructure/products/products.module.ts
  - src/presentation/controllers/products.controller.ts
- **Learnings:**
  - **Patterns discovered:** Reusing established Clean Architecture patterns for resource retrieval by ID (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** Fixed linting errors in test files by using `jest.Mocked<IProductRepository>` and disabling `unbound-method` where necessary, which is a recurring theme in the codebase's test suites.
---

## 2026-04-04 - US-014
- What was implemented:
  - DELETE /api/v1/products/:id endpoint to delete a product.
  - DeleteProductUseCase with validation to block deletion if product has history (Inventory, Transactions, Movements, etc.).
  - ProductHasHistoryException in domain exceptions.
  - Updated IProductRepository and ProductRepository to include hasHistory method checking multiple tables (Inventory, ReceiptTicketLine, IssueTicketLine, StockMovement, SplitTicket source/target).
  - Swagger documentation for the new endpoint including 204 (No Content), 404 (Not Found), and 422 (Unprocessable Entity) for history blocks.
  - Unit tests for DeleteProductUseCase and updated all existing product-related test files to satisfy the new repository interface.
- Files changed:
  - src/domain/contracts/product.repository.interface.ts
  - src/domain/exceptions/product.exceptions.ts
  - src/infrastructure/database/repositories/product.repository.ts
  - src/application/use-cases/products/delete-product.use-case.ts
  - src/application/use-cases/products/delete-product.use-case.spec.ts
  - src/infrastructure/products/products.module.ts
  - src/presentation/controllers/products.controller.ts
  - src/application/use-cases/products/create-product.use-case.spec.ts
  - src/application/use-cases/products/update-product.use-case.spec.ts
  - src/application/use-cases/products/get-product.use-case.spec.ts
  - src/application/use-cases/products/list-products.use-case.spec.ts
- **Learnings:**
  - **Patterns discovered:** Adding a method to an interface requires updating all mock definitions in test files, even if those tests don't use the new method, to maintain type safety.
  - **Gotchas encountered:** The `@typescript-eslint/unbound-method` lint rule requires using `repository["methodName"]` or casting to `jest.Mock` when passing repository methods to Jest's `expect` calls.
---

## 2026-04-04 - US-015
- What was implemented:
  - POST /api/v1/unit-conversions endpoint to define conversion rules between units for a product.
  - CreateUnitConversionUseCase with validation for existing product, fromUnit, and toUnit.
  - UnitConversionRepository implemented with Prisma.
  - UnitConversionAlreadyExistsException for handling duplicate conversion rules.
  - UnitConversionsModule created to handle dependencies and avoid circularity between Products and Units.
  - Swagger documentation for the new endpoint.
  - Unit tests for CreateUnitConversionUseCase.
- Files changed:
  - src/domain/contracts/unit-conversion.repository.interface.ts
  - src/infrastructure/database/repositories/unit-conversion.repository.ts
  - src/domain/exceptions/unit.exceptions.ts
  - src/application/use-cases/units/create-unit-conversion.use-case.ts
  - src/application/use-cases/units/create-unit-conversion.use-case.spec.ts
  - src/presentation/dtos/units/create-unit-conversion.dto.ts
  - src/presentation/controllers/unit-conversions.controller.ts
  - src/infrastructure/unit-conversions/unit-conversions.module.ts
  - src/app.module.ts
- **Learnings:**
  - **Patterns discovered:** Used `forwardRef()` in `UnitConversionsModule` to resolve potential circular dependencies between `ProductsModule` and `UnitsModule` while still being able to use their exported repositories.
  - **Gotchas encountered:** When defining a new module that sits between two others (like `UnitConversions` between `Products` and `Units`), careful consideration of the dependency graph is needed to prevent NestJS from failing to resolve providers.
---

## 2026-04-04 - US-016
- What was implemented:
  - PATCH /api/v1/unit-conversions/:id endpoint to update existing conversion rules.
  - UpdateUnitConversionUseCase with validation for existence.
  - Added findById and update methods to IUnitConversionRepository and its Prisma implementation.
  - UnitConversionNotFoundException in domain exceptions.
  - Swagger documentation for the new endpoint.
  - Unit tests for UpdateUnitConversionUseCase.
- Files changed:
  - src/domain/contracts/unit-conversion.repository.interface.ts
  - src/infrastructure/database/repositories/unit-conversion.repository.ts
  - src/domain/exceptions/unit.exceptions.ts
  - src/application/use-cases/units/update-unit-conversion.use-case.ts
  - src/application/use-cases/units/update-unit-conversion.use-case.spec.ts
  - src/presentation/dtos/units/update-unit-conversion.dto.ts
  - src/presentation/controllers/unit-conversions.controller.ts
  - src/infrastructure/unit-conversions/unit-conversions.module.ts
  - src/application/use-cases/units/create-unit-conversion.use-case.spec.ts (lint fix)
- **Learnings:**
  - **Patterns discovered:** Reused the strict mocking pattern `as unknown as jest.Mocked<Interface>` in tests to satisfy `@typescript-eslint/no-unsafe-*` rules.
  - **Gotchas encountered:** NestJS/TypeScript requires `import type` for interfaces used in decorated constructors when `isolatedModules` is enabled.
---

## 2026-04-04 - US-017
- What was implemented:
  - GET /api/v1/unit-conversions endpoint to list all unit conversion rules.
  - Support for filtering by productId via query parameters.
  - ListUnitConversionsUseCase with unit tests covering success and filtered cases.
  - Added findAll method to IUnitConversionRepository and its Prisma implementation.
  - Swagger documentation for the new endpoint.
- Files changed:
  - src/domain/contracts/unit-conversion.repository.interface.ts
  - src/infrastructure/database/repositories/unit-conversion.repository.ts
  - src/application/use-cases/units/list-unit-conversions.use-case.ts
  - src/application/use-cases/units/list-unit-conversions.use-case.spec.ts
  - src/presentation/dtos/units/list-unit-conversions.dto.ts
  - src/presentation/controllers/unit-conversions.controller.ts
  - src/infrastructure/unit-conversions/unit-conversions.module.ts
- **Learnings:**
  - **Patterns discovered:** Following the established Clean Architecture pattern for listing resources with optional filters (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** When using Prisma `findMany` with optional filters, using `undefined` for the filter value effectively ignores it, which is useful for optional query parameters.
  - Ensured factor is serialized as a string with 3 decimal places using `toFixed(3)` as per project mandates.
---

## 2026-04-04 - US-018
- What was implemented:
  - GET /api/v1/unit-conversions/:id endpoint to retrieve a specific unit conversion by its ID.
  - GetUnitConversionByIdUseCase with unit tests (success and not found cases).
  - Swagger documentation for the new endpoint including 404 response.
- Files changed:
  - src/application/use-cases/units/get-unit-conversion-by-id.use-case.ts
  - src/application/use-cases/units/get-unit-conversion-by-id.use-case.spec.ts
  - src/infrastructure/unit-conversions/unit-conversions.module.ts
  - src/presentation/controllers/unit-conversions.controller.ts
- **Learnings:**
  - **Patterns discovered:** Reusing established Clean Architecture patterns for resource retrieval by ID (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** Discovered that unit conversion use cases are currently located in `src/application/use-cases/units/` instead of a separate `unit-conversions` folder, maintaining consistency with existing structure.
---

## 2026-04-04 - US-019
- What was implemented:
  - DELETE /api/v1/unit-conversions/:id endpoint to delete a unit conversion rule.
  - DeleteUnitConversionUseCase with validation to ensure existence before deletion.
  - Added `delete` method to `IUnitConversionRepository` and its Prisma implementation.
  - Swagger documentation for the new endpoint including 204 (No Content) and 404 (Not Found) responses.
- Files changed:
  - src/domain/contracts/unit-conversion.repository.interface.ts
  - src/infrastructure/database/repositories/unit-conversion.repository.ts
  - src/application/use-cases/units/delete-unit-conversion.use-case.ts
  - src/presentation/controllers/unit-conversions.controller.ts
  - src/infrastructure/unit-conversions/unit-conversions.module.ts
- **Learnings:**
  - **Patterns discovered:** Following the established Clean Architecture pattern for resource deletion (Controller -> Use Case -> Repository).
  - **Gotchas encountered:** When using the `replace` tool, avoid using `...` as it is not allowed and will cause the tool to fail to find the string. Always provide the exact literal text for replacement.
---

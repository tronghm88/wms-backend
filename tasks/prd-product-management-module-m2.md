# PRD:
 Product Management Module (M2)

## Overview
This module provides the core master data management for the Warehouse Management System (WMS), covering Units, Categories, Products, and Unit Conversion rules. It serves as the foundation for all inventory transactions and the computation engines (Unit Conversion and Pricing).

## Goals
-
 Provide a robust CRUD interface for master data.
- Ensure data integrity for physical metrics using `NUMERIC(15,3)`.
- Enforce unique manual codes for Categories and Products.
- Support Swagger/OpenAPI documentation for all endpoints.
- Maintain strict Clean Architecture boundaries.

## Quality Gates

These commands must pass for every user story:
- `npm run lint` - Linting check
- `npx tsc --noEmit` - TypeScript type checking
- **Workflow:** Auto-commit the changes with a descriptive message after successfully completing each task and passing the quality gates.

## User
 Stories

### US-001: Create Unit API
**Description:** As an Admin, I want to create a new Unit (e.g., 'm2', 'kg') so that it can be used in product definitions.

**Acceptance Criteria:**
- [ ] Implement `POST /api
/v1/units` endpoint.
- [ ] DTO includes `code` (string, required, unique).
- [ ] Validate `code` is unique in the database.
- [ ] Follow Clean Architecture: Domain Entity, Repository Interface, Use Case, Infrastructure Repository, and Presentation Controller.
- [ ] Document endpoint with Swagger.

### US-002: List Units API
**Description:** As a User, I want to list all available Units.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/units` endpoint.
- [ ] Return an
 array of Unit objects.
- [ ] Document endpoint with Swagger.

### US-003: Get Unit by Code API
**Description:** As a User, I want to retrieve details of a specific Unit by its code.

**Acceptance Criteria:**
- [ ] Implement `GET /api/
v1/units/:code` endpoint.
- [ ] Return Unit object or 404 if not found.
- [ ] Document endpoint with Swagger.

### US-004: Delete Unit API
**Description:** As an Admin, I want to delete a Unit that is no longer needed
.

**Acceptance Criteria:**
- [ ] Implement `DELETE /api/v1/units/:code` endpoint.
- [ ] Block deletion if the Unit is referenced by any Product or UnitConversion (Foreign Key constraint).
- [ ] Document endpoint with Swagger.

### US-005
: Create Category API
**Description:** As an Admin, I want to create a new Product Category with a manual code.

**Acceptance Criteria:**
- [ ] Implement `POST /api/v1/categories` endpoint.
- [ ] DTO includes `code` (unique, required) and
 `name` (required).
- [ ] Validate `code` uniqueness.
- [ ] Follow Clean Architecture patterns.
- [ ] Document endpoint with Swagger.

### US-006: Update Category API
**Description:** As an Admin, I want to update an existing Category's name or
 code.

**Acceptance Criteria:**
- [ ] Implement `PATCH /api/v1/categories/:id` endpoint.
- [ ] Allow updating `code` (with uniqueness check) and `name`.
- [ ] Document endpoint with Swagger.

### US-007: List Categories
 API
**Description:** As a User, I want to list all product categories.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/categories` endpoint.
- [ ] Support basic pagination/sorting if applicable (optional for MVP).
- [ ] Document endpoint with Swagger
.

### US-008: Get Category by ID API
**Description:** As a User, I want to retrieve a specific category by its ID.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/categories/:id` endpoint.
- [ ] Return Category
 object or 404.
- [ ] Document endpoint with Swagger.

### US-009: Delete Category API
**Description:** As an Admin, I want to delete a category.

**Acceptance Criteria:**
- [ ] Implement `DELETE /api/v1/categories/:id
` endpoint.
- [ ] Block deletion if Category has associated Products.
- [ ] Document endpoint with Swagger.

### US-010: Create Product API
**Description:** As an Admin, I want to create a new Product with manual code and physical metrics.

**Acceptance Criteria:**
- [ ] Implement `POST /api/v1/products` endpoint.
- [ ] DTO includes `code` (unique), `name`, `categoryId`, `baseUnit`, `basePrice` (string for decimal), `length`, `width`, `height`.
- [ ] Validate `categoryId
` and `baseUnit` exist.
- [ ] Validate `code` uniqueness.
- [ ] Ensure `Decimal` fields are handled correctly (stored as `NUMERIC(15,3)`).
- [ ] Document endpoint with Swagger.

### US-011: Update Product API
**Description:** As an Admin, I want to update product details.

**Acceptance Criteria:**
- [ ] Implement `PATCH /api/v1/products/:id` endpoint.
- [ ] Allow updating all fields (code, name, metrics, etc.).
- [ ] Validate `code
` uniqueness if changed.
- [ ] Document endpoint with Swagger.

### US-012: List Products API
**Description:** As a User, I want to list all products.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/products` endpoint.
-
 [ ] Include Category name and Unit code in response (Join/Include).
- [ ] Document endpoint with Swagger.

### US-013: Get Product by ID API
**Description:** As a User, I want to retrieve details of a specific product.

**Acceptance Criteria:**
- [
 ] Implement `GET /api/v1/products/:id` endpoint.
- [ ] Return Product object with relations or 404.
- [ ] Document endpoint with Swagger.

### US-014: Delete Product API
**Description:** As an Admin, I want to delete a
 product.

**Acceptance Criteria:**
- [ ] Implement `DELETE /api/v1/products/:id` endpoint.
- [ ] Block deletion if Product has Inventory or Transaction history.
- [ ] Document endpoint with Swagger.

### US-015: Create Unit Conversion API
**
Description:** As an Admin, I want to define a conversion rule between units for a product.

**Acceptance Criteria:**
- [ ] Implement `POST /api/v1/unit-conversions` endpoint.
- [ ] DTO includes `productId`, `fromUnit`, `toUnit`, 
`factor` (string for decimal).
- [ ] Validate `productId`, `fromUnit`, and `toUnit` exist.
- [ ] Document endpoint with Swagger.

### US-016: Update Unit Conversion API
**Description:** As an Admin, I want to update an existing conversion rule.


**Acceptance Criteria:**
- [ ] Implement `PATCH /api/v1/unit-conversions/:id` endpoint.
- [ ] Allow updating `factor`.
- [ ] Document endpoint with Swagger.

### US-017: List Unit Conversions API
**Description:** As
 a User, I want to list all unit conversion rules.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/unit-conversions` endpoint.
- [ ] Support filtering by `productId`.
- [ ] Document endpoint with Swagger.

### US-018
: Get Unit Conversion by ID API
**Description:** As a User, I want to retrieve a specific conversion rule.

**Acceptance Criteria:**
- [ ] Implement `GET /api/v1/unit-conversions/:id` endpoint.
- [ ] Document endpoint with Swagger.

### US
-019: Delete Unit Conversion API
**Description:** As an Admin, I want to delete a conversion rule.

**Acceptance Criteria:**
- [ ] Implement `DELETE /api/v1/unit-conversions/:id` endpoint.
- [ ] Document endpoint with Swagger.

##
 Functional Requirements
- FR-1: All manual codes (`Unit.code`, `Category.code`, `Product.code`) must be unique and validated before persistence.
- FR-2: Numeric fields (prices, dimensions, factors) must use `NUMERIC(15,3)` in the database.

- FR-3: API responses must serialize `Decimal` fields as `String`.
- FR-4: Clean Architecture boundaries must be respected: Domain layer must have zero dependencies on NestJS or Prisma.
- FR-5: Deleting master data must be blocked if dependencies exist (e.g.,
 cannot delete Category if Products exist).

## Non-Goals
- Unit Conversion Engine calculation logic (FR08 engine) is not in this PRD scope (only CRUD for rules).
- Multi-warehouse support.
- Bulk import/export via Excel (Phase 2/3).

## Technical Considerations

- Use `decimal.js` for any server-side math or precision handling.
- Use `class-validator` for DTO validation.
- Implement a global `ExceptionFilter` to handle domain exceptions and return standard error responses.
- Ensure all repository methods are defined in `src/domain/
contracts` and implemented in `src/infrastructure/database/repositories`.

## Success Metrics
- All 19 API endpoints are functional and passing quality gates.
- 100% Swagger documentation coverage.
- Zero floating-point rounding errors in master data.
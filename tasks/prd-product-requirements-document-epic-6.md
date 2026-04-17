# Product Requirements Document: EPIC 6 - Reporting Intelligence & Document Export

**Epic Goal:** Provide stakeholders with high-fidelity data visualization, professional document generation, and legacy-compatible data exports to bridge digital operations with physical logistics and accounting.

---

## US-601: High-Volume Inventory Snapshot (Operational Grid)
**User Story:** As an Analyst, I want to view the entire warehouse state in a single, high-performance grid so that I can perform rapid visual audits without pagination delays.

### Acceptance Criteria
- Backend provides a specialized `/api/v1/inventory/snapshot` endpoint optimized for bulk retrieval (Full Snapshot).
- Payload must serialize all `NUMERIC(15,3)` fields (Quantity, Weight, Dimensions) as **Strings** to prevent floating-point truncation.
- Frontend uses `pluto_grid` with row virtualization to handle 10,000+ records at 60FPS.
- Grid supports client-side multi-column filtering, sorting, and grouping.

### Implementation Tasks
- **Task 6.1.1 (Backend):** Implement `GetInventorySnapshotUseCase` and repository method `findAllActiveStock()` utilizing optimized query selection.
- **Task 6.1.2 (Backend):** Create `GET /api/v1/inventory/snapshot` controller with response DTOs enforcing string-serialization for numeric fields.
- **Task 6.1.3 (Frontend):** Build `InventorySnapshotScreen` using `pluto_grid` and integrate with a Riverpod provider for state management.

---

## US-602: Advanced Audit Analytics (Traceability)

**User Story:** As an Admin, I want to query historical movements using granular filters so that I can investigate discrepancies or verify staff actions.

### Acceptance Criteria
- Support comprehensive filters: Date Range (Start/End), Product ID, Transaction Type (Receipt, Issue, Split, Adjustment), User ID, Ticket ID, and Product Category.
- Results must display the calculated "Running Balance" at each transaction step.
- Backend must enforce RBAC: Only `ADMIN` or `SUPER_ADMIN` can access this detailed audit endpoint.

### Implementation Tasks
- **Task 6.2.1 (Backend):** Implement `SearchAuditLogsUseCase` with dynamic SQL filter logic and running balance computation in the infrastructure layer.
- **Task 6.2.2 (Backend):** Create `GET /api/v1/audit-logs` endpoint with query parameter validation using `class-validator`.
- **Task 6.2.3 (Frontend):** Build `AuditTrailSearchScreen` featuring a multi-field filter drawer and a chronological movement list view.

---

## US-603: Professional PDF Document Generation
**User Story:** As a Logistical Runner, I want to generate professional PDFs for specific tickets so that drivers have official paperwork for transport and handovers.

### Acceptance Criteria
- Three distinct professional templates generated on the server:
    - **PN (Goods Receipt):** Focus on supplier info, receipt date, and itemized roll dimensions.
    - **PX (Goods Issue):** Focus on customer info, pricing/discounts, and final totals.
    - **PT (Split Ticket):** Focus on Parent-Child lineage and fractional sizes.
- Backend uses **Puppeteer** to render HTML-to-PDF templates.
- Documents are streamed directly as binary blobs with `Content-Type: application/pdf`.

### Implementation Tasks
- **Task 6.3.1 (Backend):** Setup `PdfReportService` using Puppeteer and develop Handlebars/HTML templates for PN, PX, and PT.
- **Task 6.3.2 (Backend):** Create `GET /api/v1/documents/:type(pn|px|pt)/:id/pdf` endpoint to generate and stream the document.
- **Task 6.3.3 (Frontend):** Implement "Print PDF" action buttons in the Ticket Detail screens that trigger the backend stream and open the native system viewer.

---

## US-604: Legacy Accounting Excel Export
**User Story:** As the Lead Accountant, I want to export monthly movements in a fixed format so that I can import them into our legacy spreadsheets without manual VLOOKUPs.

### Acceptance Criteria
- Export format strictly matches the "Legacy Standard":
    - Fixed Columns: `Date`, `Ticket ID`, `Product Code`, `Type (In/Out)`, `Quantity`, `Running Balance`.
- Backend uses **ExcelJS** to generate `.xlsx` files dynamically.
- Supports date range selection (e.g., Month-to-Date or Year-to-Date).

### Implementation Tasks
- **Task 6.4.1 (Backend):** Implement `ExcelReportService` to map internal domain stock movements to the 6-column legacy layout.
- **Task 6.4.2 (Backend):** Create `GET /api/v1/reports/inventory-movement/excel` endpoint accepting `startDate` and `endDate` query parameters.
- **Task 6.4.3 (Frontend):** Add "Export for Accounting" action in the Reports menu with a date range selection dialog.

---

## Technical Constraints for Epic 6
1. **Memory Efficiency:** The `snapshot` endpoint must utilize database-level pagination or optimized JSON streaming if the row count exceeds 20,000.
2. **Numeric Precision:** All values in Excel and PDF must be formatted using `decimal.js` to exactly 3 decimal places.
3. **Security Validation:** All reporting endpoints must verify the user's active session and specific `READ_REPORTS` or `READ_AUDIT` permissions via NestJS Guards.

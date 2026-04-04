---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - requirement.md
  - _bmad-output/brainstorming/brainstorming-session-2026-03-28-1348.md
  - _bmad-output/customer-questions.md
  - _bmad-output/estimate-v2.md
  - _bmad-output/wireframes/wireframe-index.md
workflowType: 'prd'
classification:
  projectType: desktop_app
  domain: warehouse_operations
  complexity: medium-high
  projectContext: brownfield
  offlineMode: false
  repoStructure: separated
  apiContract: REST + OpenAPI/Swagger
  apiVersioning: /api/v1/ prefix from Sprint 0
  uxStatus: deferred_to_separate_phase
  wireframesStatus: reference_only
  scopeApproach: fixed_price_with_tracked_tbds
  techStack:
    frontend: Flutter 3.x Desktop (Dart)
    ui: Material 3 + pluto_grid + flutter_form_builder
    state: Riverpod
    apiClient: Dio + Retrofit
    backend: NestJS (Node.js + TypeScript)
    database: PostgreSQL 16
    orm: Prisma
    auth: JWT + Passport (NestJS) / flutter_secure_storage
    export: ExcelJS + Puppeteer (backend-side)
    deploy: Docker + Docker Compose
  openTBDs:
    - Q3: single vs multi-warehouse
    - Q9: concurrent users count
---

# Product Requirements Document - WMS

**Author:** Windy  
**Date:** 2026-03-30

## Executive Summary

WMS là hệ thống quản lý kho desktop (Windows) được xây dựng dành riêng cho doanh nghiệp kinh doanh vật liệu dạng cuộn, xấp, thùng. Hệ thống thay thế hoàn toàn quy trình excel cũ, hoạt động như "Single Source of Truth" cho toàn bộ quy trình: nhập, xuất, tách hàng, phân quyền nội bộ và báo cáo. Đối tượng chính sử dụng là Admin (toàn quyền) và Nhân viên nhập hàng, thao tác 100% online tại một địa điểm duy nhất.

### What Makes This Special
Hai "Engine" cốt lõi tạo nên sự khác biệt hoàn toàn với các phần mềm generic:
1. **Unit Conversion Engine:** Tự động quy đổi tỷ lệ giữa số cuộn, số mét vuông (m²), và kilogram (kg) phụ thuộc vào thông số vật lý của từng mã sản phẩm. Loại bỏ ngay lập tức những lỗi "nhầm lẫn nhân chia" phát sinh thủ công.
2. **Per-Customer Pricing Engine:** Tự động kích hoạt cơ chế dò tìm mức giá và phần trăm chiết khấu xếp hạng ưu tiên của từng Khách hàng khi thao tác Phiếu Xuất.

## Project Classification

| Dimension | Value |
|---|---|
| Project Type | Desktop Application (Windows, Flutter 3.x) |
| Domain | Warehouse Operations / Materials Trading |
| Complexity | Medium-High |
| Project Context | Brownfield — requirements doc provided by customer |
| Connectivity | Always-online (no offline mode required) |
| Repo Structure | Separated — Flutter client repo + NestJS API repo |
| Delivery Model | Fixed-price contract |
| UX Status | Wireframes are reference only; UI redesign deferred |

## Success Criteria

### User Success
- Nhân viên tạo phiếu xuất hoàn chỉnh (chọn KH → thêm SP → tự động tính giá/chiết khấu → xác nhận) trong `< 3 phút`, không cần tra bảng giá.
- Tồn kho hiển thị real-time ngay sau giao dịch, xóa bỏ công đoạn chốt số Excel lúc 17h.
- Quá trình "Tách Cuộn" tự động tính số lượng tồn dư cho cuộn gốc ngay khi lưu.
- Khách hàng không cần config lại công thức Excel cũ nhờ file download Report (Báo cáo NXT) đã map định dạng y hệt mẫu hiện hành.

### Business & Engineering Success
- **Go-live On Time:** Deploy Phase 1 production trong ~11 tuần (Team size 2 devs).
- **UAT & Quality:** Hoàn thiện bài test trên 26 màn hình và 5 module chức năng; tỷ lệ sai lệch khi lưu trữ tính toán kiểu dữ liệu quy đổi là 0%.
- **Architecture Stability:** Database dùng kiểu `NUMERIC(15,3)` lưu zero rounding errors; log lại mọi thao tác qua Audit/StockMovement Log bất biến; Flutter frontend decouple hoàn toàn NestJS.

## Project Scope & Delivery Strategy

### MVP Strategy & Philosophy
**MVP Approach:** "Operational Reliability" MVP. Dự án theo hợp đồng fixed-price nên bỏ qua thiết kế hào nhoáng. Yếu tố cốt lõi là sự "Chính xác tuyệt đối ở công thức toán học" và "Trải nghiệm nhập liệu siêu tốc bằng Keyboard". Mọi scope-creep đều mặc định nhường chỗ cho tính ổn định của Phase 1.

**Resource & Timeline:** 
- 2 Developers (1 Frontend Flutter, 1 Backend NestJS) + 1 PM/QA.
- Estimate: 2.5 tháng (~10-11 sprints/tuần).

### Phase 1: Minimum Viable Product (Confirmed Scope)
Tập trung vào vận hành kho hằng ngày, quy mô 26 screens + 5 cross-cutting features (~59 man-days + buffer).

**Core User Journeys Supported:**
- Khởi tạo giao dịch Nhập, Xuất, Tách mượt mà.
- Kiểm soát tồn kho & truy vấn Audit Log.
- Xuất số liệu Báo cáo NXT cuối tháng.

**Modules & Features Included:**
- M1: Auth & System Settings (S01–S06).
- M2: Danh mục — Sản phẩm, Khách hàng, Bảng giá (S07–S12).
- M3: Phiếu nhập hàng (S14–S16).
- M4: Phiếu xuất hàng (S19–S22).
- M5: Phiếu tách hàng (S24–S26).
- M6: Tồn kho tổng hợp + Chi tiết (S27–S28).
- M7: Báo cáo NXT Excel mapping (S30).
- Cross-logic: Auto-numbering, Convert/Price Engine, PDF Document Export, RBAC Security.

### Phase 2: Growth Features (TBD Scope)
Phần đang pending chốt thiết kế & budget (+11 man-days):
- Quản lý Nhà cung cấp và Lịch sử giá nhập.
- Dashboard báo cáo đồ thị Analytics toàn công ty.
- Phiếu điều chỉnh tồn kho độc lập cho admin xử lý thất thoát.

### Phase 3: Vision (Out of Scope - v1)
Các business vision lớn không nằm trong contract hiện tại:
- Triển khai đa kho (Multi-warehouse ecosystem).
- Mobile application quét Barcode/QR Code cho thủ kho duyệt hàng.
- Integration qua chuẩn API với hệ sinh thái kế toán MISA, SAP, FAST.

## User Journeys (Personas in Action)

**Persona 1: Minh — Nhân viên kho**
*Journey 1: Tạo Phiếu xuất (Happy Path)*
Minh mở WMS, chọn khách hàng "Công ty A". Hệ thống tự load discount profile của khách hàng này. Minh gõ tên và đẩy 3 loại cuộn vải vào giỏ. Phần mềm tính tự động kích cỡ, quy ra tổng tiền và VAT. Minh bấm `Ctrl+S` xác nhận phiếu `PX-045` thành công trong vẹn vẹn 2 phút.

*Journey 2: Phục vụ tách cuộn (Edge Case)*
Tài xế giao nhận cần lẻ 30m từ cuộn 100m. Minh mở Phiếu Tách, chọn cuộn ID gốc ở kho, gõ "-30". WMS instant-calculate và báo: Cuộn gốc còn 70m. Minh Enter, database khóa cuộn cũ và sản sinh inventory log báo cáo sự thay đổi real-time.

**Persona 2: Hà — Kế toán trưởng / Admin**
*Journey 3: Truy vết số liệu (Audit)*
Cuối tháng, Hà phát hiện mặt hàng A bị thiếu tồn ảo. Hà bật tab Audit History trên Admin page, filter sản phẩm A, và dò ra Phiếu Xuất số 032 đã làm âm kho do thủ tục bypass của nhân sự hôm kia.
*Journey 4: Nhồi số vào bảng Cân đối xuất excel*
Lúc 5 rưỡi chiều, Hà chỉ cần vào mục Reports, ấn nút Generate Report theo tháng. File Excel tải xuống với form mẫu 100% match y chang bảng excel Công ty cô đang dùng chục năm nay, thay vì phải manually vlookup từ các sheet rời rạc.

## Desktop Specific & Domain Context Constraints

- **Platform Delivery:** Product bàn giao ra Native Desktop format `.exe` chuyên dụng Windows vì kho thường set up máy dòng này. Chạy Flutter build thẳng Desktop nên performance mượt như các app thông thường. Khả năng chạy Mac (MacOS builds) là có nhưng testing effort thả cho user.
- **Update Workflow (Manual Bypass):** Phase 1 không viết engine Auto-updater OTA phức tạp. Backend sẽ có cờ `version check`, khi build cũ mở màn hình, cờ check báo `OutdatedVersion`, User tự bấm link dẫn ra Drive/FileServer để tự down file setup đè.
- **Hardware Integration:** Chưa hook code C++ thẳng vào Spooler máy in nhiệt. Toàn bộ in ấn Phiếu được sinh ra file PDF trên server NestJS gửi về Flutter, người dùng xài Chrome hoặc FoxIT/Acrobat reader mở in. 
- **Bảo toàn dữ liệu Online:** 100% online app, mất mạng Flutter sẽ đỏ Banner màn hình chặn mọi submit, ngăn trạng thái half-synced dữ liệu.

## Functional Requirements (Capability Contract)

**1. Authentication & System Control**
- FR01: Admin có thể sửa, khóa tài khoản và phân quyền chức năng cụ thể dựa trên ma trận RBAC.
- FR02: Hệ thống chứng thực đăng nhập qua chuẩn bảo mật JWT, điều hướng tính năng Navigation linh hoạt.
- FR03: Admin có thể lưu các biến Cấu hình Hệ thống (Tên chuẩn đơn vị đo lường, Form mẫu Excel Uploads).

**2. Master Data Management**
- FR04: Phân quyền Users thao tác CRUD trên Category Sản phẩm, kèm thuộc tính lõi chiều dài quy chuẩn và khối lượng tiêu chuẩn.
- FR05: User thao tác quản trị thư viện Danh bạ Khách hàng và cấu trúc bảng Giá / Profile Chiết khấu cho họ.

**3. Inventory Transactions**
- FR06: User có quyền được tạo bộ 3 phiếu: Nhập kho, Xuất Kho (assign theo Khách hàng và tình trạng công nợ sơ bộ) và Tách hàng từ cuộn chuẩn.
- FR07: Việc Xác nhận (Confirm) các trạng thái phiếu sẽ biến Data thành immutable, và Hệ thống kích hoạt module cấp Mã số Ticket ID thông minh tự động (như PN-0001, PX-0002).

**4. Computation Core System (Auto-Engines)**
- FR08: Engine Quy đổi gọi ngầm tự tính metric m², kg, cuộn lập tức lúc add item vào Line phiếu.
- FR09: Engine Định giá Auto-load bảng Rule của khách → map ra Disount Rate → Fill vào Field Price mà không báo lỗi nếu user đang offline giữa chừng.

**5. Inventory Operations**
- FR10: Database chỉ Update Stock Balance (mức lượng kho) lúc Phiếu "Confirmed".
- FR11: Mọi hành động tăng giảm Update Stock tạo rác log Insert-Only trong lịch sử (Audit Trail) phục vụ truy vết ai đã làm lúc mấy giờ trên phiếu xuất nào.
- FR12: Chặn Hard-Limit không cho xuất quá quota hiện tồn (Negative-Stock). 
- FR13: Role cấp cao có thể Hủy/Sửa phiếu đã Xác nhận nhằm Trigger Audit Roll-back tồn kho ngược lại trạng thái cũ.

**6. Analytics & Outputs**
- FR14: Report Engine đẩy thông tin Real-time sang Excel Format và Native PDF (generated by Backend Puppeteer).

## Non-Functional Requirements (NFRs)

**1. Performance Context**
- **UI Grid:** Bảng tồn kho có thể render trơn mượt vạn Record dưới thời lượng 1 giây nhờ virtual-rendering (`pluto_grid`).
- **Response Rates:** Nhịp đập API tới NestJS khép kín dưới < 500 mili-seconds; App boot < 3s trên Windows PC phổ thông.

**2. Data & Security Integrity**
- **Numeric Lock:** Schema DB bắt bấp kiểu lưu Math là dạng `NUMERIC(15,3)` thay thế dạng float gốc code.
- Mật khẩu thiết kế Salt+Hash bằng thuật toán `bcrypt`, gói Token Auth được mã hóa sâu tại local hardware `flutter_secure_storage`. Mạng kết nối TLS/1.2 over HTTPS.

**3. Workplace Ergonomic Usability**
- **Tốc độ gõ phím:** Tối ưu Navigation. Các Form nhập xuất được optimize để có thể chỉ dùng phím `Tab` và `Enter` hoặc key-bind như `Ctrl+S` mà bypass 90% thao tác chỏ chuột để tiết kiệm thì giờ Kho tàng.

## Risk Management

**1. Technical Constraint Failures:** Sai lệch đơn vị m² quy cuộn (Rounding Math). 
*Giải pháp:* Lock chặt Unit / Pricing Engine bằng Test Coverage 100% CI (Test tự động Unit tests) chọc sâu backend logic trước khi UI coder mapping dữ liệu.
**2. Scope Creep on Fixed-Price:** Khách vòi thêm màn hình ngoài luồng. 
*Giải pháp:* Chốt cứng danh mục 26 UI. Gạt sang Phase Growth các scope ngoài. Dùng wireframe nháp đánh lừa Visual expectation từ phase sớm.
**3. Resource Deadlocks:** Frontend đợi Backend rảnh tay Code API lụt tiến độ trong khung hẹp 2 tuần đầu.
*Giải pháp:* Xây Swagger/OpenAPI Contract mock-up chạy chay JSON ngay tuần đầu để tách rẽ quá trình UI code. Tốc độ code song song Flutter / NestJS đẩy max nhịp.

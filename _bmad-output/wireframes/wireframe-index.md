# WMS — UX Wireframes

**Dự án:** Hệ thống Quản lý Kho Vật liệu (WMS)
**Ngày:** 2026-03-28
**Style:** Ant Design Pro — Desktop Web App (1440×900)
**Tổng số wireframe:** 8 màn hình chính

---

## S01 — Màn hình Đăng nhập + App Layout (REQ 2.1.1)

Layout tổng thể: sidebar tối bên trái, header, content area. Login form centered.

![S01 Login](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_login_layout_1774683372802.png)

---

## S08 — Form Sản phẩm + Quy đổi đơn vị (REQ 2.2.1)

Two-column layout. Conditional "Thuộc tính hàng cuộn" khi ĐVT = cuộn. Unit conversion config inline.

![S08 Product Form](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_product_form_1774683423529.png)

---

## S11 — Cấu hình Bảng giá & Chiết khấu (REQ 2.2.3)

Per-customer discount config. Toggle chiết khấu chung vs per-product. Preview thành tiền sau chiết khấu.

![S11 Price Policy](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_price_policy_1774683512180.png)

---

## S14 — Danh sách Phiếu nhập (REQ 2.3.1)

Filter theo ngày, người lập. Status badges: Nháp (gray) / Đã xác nhận (green). CRUD actions.

![S14 Goods Receipt List](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_goods_receipt_list_1774683481719.png)

---

## S20 — Tạo / Chỉnh sửa Phiếu xuất (REQ 2.4.2, 2.4.3, 2.4.4)

Màn hình phức tạp nhất. Header info + product line table với auto-pricing. Summary card + Draft/Confirm actions.

![S20 Goods Issue Form](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_goods_issue_form_1774683390803.png)

---

## S25 — Tạo Phiếu Tách Hàng (REQ 2.5.2, 2.5.3)

Chọn sản phẩm gốc → hiện tồn hiện tại. Bảng tách với "Tạo SP mới" option. Counter "Còn lại" real-time.

![S25 Split Ticket Form](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_split_ticket_form_1774683528551.png)

---

## S27 — Bảng Tồn Kho Tổng hợp (REQ 2.6.1)

Multi-unit columns (cuộn / m² / kg). Color coding tồn thấp (orange). Xuất PDF button.

![S27 Inventory Table](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_inventory_table_1774683405880.png)

---

## S28 — Chi tiết Tồn + Stock Movement History (REQ 2.6.2)

Product summary card với unit conversions. History table với colored badges: Nhập kho (green) / Xuất kho (red) / Tách (orange) / Điều chỉnh (blue).

![S28 Stock Detail History](../../.gemini/antigravity/brain/1de632bb-674d-4c36-ba8e-59805b9d73c6/wireframe_stock_detail_history_1774683443327.png)

---

## Màn hình chưa wireframe (TBD hoặc đơn giản)

| Screen | Lý do chưa wireframe |
|---|---|
| S02 Danh sách tài khoản | Tương tự S14 — list + filter + CRUD |
| S03 Form tài khoản | Tương tự S08 — simple form |
| S09 Danh sách KH | Tương tự S14 |
| S15 Tạo Phiếu nhập | Tương tự S20 nhưng đơn giản hơn |
| S19 Danh sách Phiếu xuất | Tương tự S14 |
| S30 Báo cáo NXT | Dependent on Excel template từ KH |
| S06 Quản lý Roles | TBD — pending BQ-01, BQ-02 |
| S29 Phiếu điều chỉnh tồn | TBD — pending Q17 |
| S31 Dashboard | TBD — pending Q19 |

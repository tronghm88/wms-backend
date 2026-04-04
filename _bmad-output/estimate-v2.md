# Estimate Dự án WMS — Phiên bản Đã Điều chỉnh

**Dự án:** Hệ thống Quản lý Kho Vật liệu (WMS)
**Ngày:** 2026-03-28
**Phiên bản:** 2.0 (Điều chỉnh sau Adversarial Review)
**Dựa trên:** Phiên bản 1.0 + 5 corrections từ Adversarial Review (F04–F08)

---

## Thay đổi so với Phiên bản 1.0

| Finding | Vấn đề | Tác động |
|---|---|---|
| **F04** | Không có assumption seniority level | Thêm ghi chú assumption — không thay đổi số |
| **F05** | Thiếu overhead: meeting, review, docs | **+10.0 man-days** |
| **F06** | Sprint 2 nhồi nhét engine + module → critical path bottleneck | Tái cấu trúc sprint plan |
| **F07** | Không có vòng lặp fix sau UAT | **+5.0 man-days** |
| **F08** | Migration dữ liệu cũ không có estimate | Thêm line item conditional |

---

## Assumptions (Giả định nền tảng)

> Tất cả estimate dựa trên các giả định sau. Nếu thực tế khác, estimate cần được điều chỉnh lại.

- **Developer level:** Mid-level (≥2 năm kinh nghiệm React + Node.js). Junior developer có thể mất 1.5–2× thời gian cho các màn hình phức tạp.
- **Team:** 2 developers làm việc song song (1 thiên về frontend, 1 thiên về backend)
- **Scope:** 1 kho duy nhất (BQ-02 = [A]). Nếu nhiều kho, cần estimate lại.
- **Nền tảng:** Web app trên browser (BQ-01 = [A]). Nếu installable desktop, cần estimate lại.
- **Không bao gồm:** Tính năng TBD (phụ thuộc vào câu hỏi khách hàng), migration dữ liệu cũ, tài liệu hướng dẫn sử dụng
- **1 man-day = 8 giờ làm việc thực sự** (không tính overhead)

---

## Estimate Chi tiết — Phiên bản 2.0

### Phần 1: Development (Screens & Features)

| Module | Screens | Man-days v1.0 | Ghi chú |
|---|---|---|---|
| M1: Auth & RBAC | S01–S06 | 6.5 | |
| M2: Danh mục | S07–S12 | 10.5 | |
| M3: Phiếu nhập | S14–S16 | 5.0 | |
| M4: Phiếu xuất | S19–S22 | 7.5 | S20 phức tạp nhất: 5 days |
| M5: Phiếu tách | S24–S26 | 5.0 | S25 phức tạp: 3.5 days |
| M6: Tồn kho | S27–S28 | 4.0 | |
| M7: Báo cáo NXT | S30 | 3.0 | Match mẫu Excel khách hàng |
| Infrastructure | Setup, Docker, Auth, X02 Conv Engine, X03 Audit | 9.5 | |
| **Subtotal Dev** | | **51.0** | QA tách riêng bên dưới |

### Phần 2: QA & Testing

| Hạng mục | Man-days v1.0 | Man-days v2.0 | Lý do thay đổi |
|---|---|---|---|
| Unit test business logic (pricing, stock calc) | 3.0 | 3.0 | Giữ nguyên |
| Integration testing | 2.0 | 2.0 | Giữ nguyên |
| Bug fixing (round 1 — internal) | 3.0 | 3.0 | Giữ nguyên |
| **Subtotal QA** | **8.0** | **8.0** | |

### Phần 3: Overhead (Mới — từ F05) ✨

> Phần bị thiếu hoàn toàn trong v1.0. Đây là chi phí thực tế phát sinh trong mọi dự án.

| Hạng mục | Tính toán | Man-days |
|---|---|---|
| Daily standup / weekly sync | 0.5h/ngày × 50 ngày làm việc ÷ 8h | 3.0 |
| Code review | ~15 min/ngày × 50 ngày ÷ 8h | 1.5 |
| Demo định kỳ cho khách hàng (4 lần) | 4 buổi × 2h ÷ 8h | 1.0 |
| Hỏi đáp requirement, phát sinh trong quá trình dev | ước tính | 2.0 |
| Viết API documentation (Swagger) | ước tính | 1.5 |
| Setup staging environment, test deployment | ước tính | 1.0 |
| **Subtotal Overhead** | | **10.0** |

### Phần 4: Post-UAT Fix Cycle (Mới — từ F07) ✨

> Phần bị thiếu trong v1.0. UAT luôn tìm ra issues — cần cycle riêng để fix và re-test.

| Hạng mục | Man-days |
|---|---|
| Fix bugs phát hiện trong UAT (ước tính 10–20 issues) | 3.0 |
| Re-test sau fix | 1.0 |
| Production deployment + smoke test | 1.0 |
| **Subtotal Post-UAT** | **5.0** |

### Phần 5: Buffer Rủi ro

| Hạng mục | Tính toán | Man-days |
|---|---|---|
| Buffer 20% trên Development scope | 51.0 × 20% | 10.2 |
| **Subtotal Buffer** | | **~10.0** |

---

## Tổng hợp — Phiên bản 2.0

| Hạng mục | v1.0 | v2.0 | Delta |
|---|---|---|---|
| Development (screens + infra) | 51.0 | 51.0 | — |
| QA & Testing | 8.0 | 8.0 | — |
| Overhead (meetings, docs, review) | **0** | **10.0** | **+10.0** |
| Post-UAT fix cycle | **0** | **5.0** | **+5.0** |
| Buffer 20% | 11.8 | 10.0 | -1.8 |
| **TỔNG BASE (confirmed scope)** | **~71** | **~84 man-days** | **+13** |

### Cộng thêm nếu khách hàng confirm TBD items

| Hạng mục | Man-days (conditional) |
|---|---|
| TBD screens (S13, S17, S18, S23, S29, S31) | +11.0 |
| Data migration dữ liệu cũ (nếu HQ-07 cần) | +5.0 |
| Tài liệu hướng dẫn sử dụng PDF (nếu NQ-10 cần) | +3.0 |
| **Tổng nếu full scope + migration + docs** | **~103 man-days** |

---

## So sánh v1.0 vs v2.0

```
v1.0:  ████████████████████████████████████░░░░  71 man-days  (thiếu overhead, thiếu post-UAT)
v2.0:  ████████████████████████████████████████░  84 man-days  (bao gồm chi phí thực tế)
Full:  ████████████████████████████████████████████████████  103 man-days  (full scope)
```

> **Tăng +13 man-days (+18%)** so với v1.0 — mức tăng này phản ánh chi phí thực tế bị bỏ sót, không phải scope tăng.

---

## Kế hoạch Sprint — Phiên bản 2.0 (Đã tái cấu trúc)

> **Thay đổi quan trọng:** Unit Conversion Engine và Pricing Engine được chuyển sang Sprint 0 (từ Sprint 2 trong v1.0). Đây là correction cho F06 — hai engine này là dependencies của mọi module sau.

| Sprint | Tuần | Nội dung | Deliverable |
|---|---|---|---|
| **Sprint 0** | Tuần 1–2 | Project setup, DB schema, Prisma migrations, Docker; **Unit Conversion Engine (X02)**; **Pricing Engine** | Foundation + 2 core engines ready |
| **Sprint 1** | Tuần 3–4 | M1: Auth & RBAC (S01–S06) + M2: Danh mục (S07–S12) | Login, quản lý sản phẩm, KH, bảng giá |
| **Sprint 2** | Tuần 5–6 | M3: Phiếu nhập (S14–S16) + M4: Phiếu xuất (S19–S22) | Nhập/Xuất hàng hoàn chỉnh |
| **Sprint 3** | Tuần 7–8 | M5: Phiếu tách (S24–S26) + M6: Tồn kho (S27–S28) + M7: Báo cáo NXT (S30) | Tách hàng, tồn kho, báo cáo |
| **Sprint 4** | Tuần 9 | Integration testing toàn hệ thống, internal bug fix round 1 | Hệ thống ổn định, sẵn sàng UAT |
| **Sprint 5** | Tuần 10 | UAT với khách hàng — demo đầy đủ tất cả luồng | Danh sách feedback từ KH |
| **Sprint 6** | Tuần 11–12 | Fix bugs từ UAT, re-test, production deploy | **Hệ thống live trên production** |
| **Buffer** | Tuần 13 | TBD screens (nếu KH đã confirm) hoặc change request | Tính năng bổ sung |

> **⏱️ Timeline v2.0: ~12–13 tuần calendar với 2 developers (~3 tháng)**
> *(Tăng từ 10–11 tuần của v1.0)*

### Critical Path (quan trọng nhất)

```
Sprint 0: Unit Conv Engine + Pricing Engine
    ↓ (phụ thuộc vào engine)
Sprint 1: Form Sản phẩm (S08) ← cần Conv Engine
Sprint 1: Bảng giá (S11) ← cần Pricing Engine
    ↓
Sprint 2: Phiếu nhập (S15) ← cần Conv Engine
Sprint 2: Phiếu xuất (S20) ← cần CẢ HAI engines
    ↓
Sprint 3: Phiếu tách (S25) ← cần Conv Engine
Sprint 3: Báo cáo NXT (S30) ← cần tất cả dữ liệu
```

> Nếu Sprint 0 bị trễ, toàn bộ critical path trễ theo. Sprint 0 KHÔNG được kéo dài quá 2 tuần.

---

## Template Báo giá — Phiên bản 2.0

| Hạng mục | Man-days | Đơn giá/day (VNĐ) | Thành tiền |
|---|---|---|---|
| **Phát triển phần mềm (base scope)** | **84** | *(team điền)* | 84 × rate |
| **TBD screens** (nếu KH confirm) | +11 | *(team điền)* | 11 × rate |
| **Data migration** (nếu cần) | +5 | *(team điền)* | 5 × rate |
| **Tài liệu hướng dẫn** (nếu cần) | +3 | *(team điền)* | 3 × rate |
| **Hosting cloud (12 tháng)** | — | *(cloud cost)* | TBD |
| | | | |
| **GIÁ BASE (đảm bảo)** | **84 man-days** | | **= 84 × rate** |
| **GIÁ FULL SCOPE (tối đa)** | **103 man-days** | | **= 103 × rate** |

> **Khuyến nghị báo giá:** Trình bày 2 mức — Base (84 days) là confirmed, Full scope (103 days) là nếu khách hàng confirm tất cả options. Việc phân tách minh bạch giúp khách hàng tự chọn và tránh tranh cãi sau.

---

## Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-03-28 | v1.0 | Estimate ban đầu từ brainstorming session |
| 2026-03-28 | v2.0 | +13 man-days overhead & post-UAT; tái cấu trúc sprint plan (engine lên Sprint 0) |

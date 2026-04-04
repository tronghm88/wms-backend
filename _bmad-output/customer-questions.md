# Danh sách câu hỏi làm rõ yêu cầu — Dự án WMS

**Dự án:** Hệ thống Quản lý Kho Vật liệu (WMS)
**Ngày soạn:** 2026-03-28
**Phiên bản:** 1.0
**Hướng dẫn sử dụng:** Các câu hỏi được chia thành 3 nhóm ưu tiên. Nhóm 🔴 BLOCKING phải được trả lời trước khi ký hợp đồng — câu trả lời ảnh hưởng trực tiếp đến kiến trúc hệ thống và phạm vi dự án.

---

## 🔴 BLOCKING — Phải trả lời trước khi ký hợp đồng

> Những câu hỏi này ảnh hưởng trực tiếp đến kiến trúc kỹ thuật. Nếu chưa có câu trả lời, chúng tôi không thể cam kết timeline hoặc báo giá chính xác.

---

### BQ-01: Loại ứng dụng — Web hay Desktop cài đặt?

Khách hàng đề cập "Desktop App". Chúng tôi cần xác nhận rõ:

- **[A]** Ứng dụng web chạy trên trình duyệt (Chrome, Edge...) tại máy tính — **không cần cài đặt**
- **[B]** Phần mềm cài đặt vào máy tính (như MISA, FAST) — **có file setup.exe**

> 💡 Lý do quan trọng: Nếu chọn [B], công nghệ xây dựng khác hoàn toàn, chi phí và thời gian tăng đáng kể.

**Trả lời của khách hàng:** _______________

---

### BQ-02: Số lượng kho — 1 kho hay nhiều kho?

Hệ thống cần quản lý bao nhiêu kho hàng?

- **[A]** 1 kho duy nhất
- **[B]** Nhiều kho / nhiều địa điểm — cần phân biệt tồn kho theo từng kho
- **[C]** Nhiều kho + có tính năng chuyển hàng giữa các kho

> 💡 Lý do quan trọng: Nếu chọn [B] hoặc [C], toàn bộ thiết kế cơ sở dữ liệu tồn kho phải thay đổi căn bản. Đây là quyết định kiến trúc không thể sửa sau khi đã xây dựng.

**Trả lời của khách hàng:** _______________

---

### BQ-03: Quy tắc ưu tiên chiết khấu khi xung đột loại

Trong cấu hình chiết khấu, một khách hàng có thể được cài:
- Chiết khấu chung theo **%** (ví dụ: giảm 10% tất cả)
- Chiết khấu riêng theo sản phẩm theo **số tiền** (ví dụ: giảm 5.000đ/cuộn)

Khi hai loại này xung đột, hệ thống xử lý thế nào?

- **[A]** Luôn ưu tiên chiết khấu theo sản phẩm (bất kể loại %)  hay tiền)
- **[B]** Tính theo thứ tự: per-product trước → nếu không có thì dùng chung
- **[C]** Không cho phép mix loại chiết khấu — khách hàng chỉ được 1 loại duy nhất (% hoặc tiền)

> 💡 Lý do quan trọng: Logic pricing engine phải được code chính xác ngay từ đầu. Sửa sau khi đã có giao dịch rất rủi ro.

**Trả lời của khách hàng:** _______________

---

## 🟠 CAO — Phải trả lời trước khi bắt đầu thiết kế

> Câu trả lời ảnh hưởng đến phạm vi dự án, số màn hình cần xây dựng, và báo giá chính xác.

---

### HQ-01: Phiếu nhập có gắn với Nhà cung cấp không?

Khi nhập hàng vào kho, hệ thống có cần lưu thông tin nhà cung cấp (NCC) không?

- **[A]** Không — chỉ ghi "nhập kho", không quan tâm mua từ đâu
- **[B]** Có — cần chọn NCC khi lập phiếu nhập, quản lý danh sách NCC

> Nếu [B]: Cần thêm màn hình "Quản lý Nhà cung cấp" và trường NCC trong phiếu nhập. +3 man-days.

**Trả lời của khách hàng:** _______________

---

### HQ-02: Đơn giá gốc sản phẩm được nhập ở đâu?

Yêu cầu đề cập "đơn giá gốc" nhưng chưa rõ cơ chế nhập:

- **[A]** Nhập trực tiếp trong form tạo/chỉnh sửa sản phẩm (cùng với tên, mã, nhóm hàng)
- **[B]** Có bảng giá riêng — có thể tạo nhiều bảng giá cho cùng 1 sản phẩm
- **[C]** Giá nhập = giá trên phiếu nhập hàng (tính trung bình hoặc FIFO)

**Trả lời của khách hàng:** _______________

---

### HQ-03: Cần in phiếu không? Nếu có, theo mẫu nào?

- **[A]** Không cần in — xem trên màn hình là đủ
- **[B]** Có — cần xuất PDF theo mẫu do khách hàng cung cấp

Nếu [B]: Phiếu nào cần in? (Đánh dấu tất cả cần thiết)
- [ ] Phiếu nhập hàng
- [ ] Phiếu xuất hàng
- [ ] Phiếu tách hàng
- [ ] Bảng tồn kho

> Nếu cần in: khách hàng cần cung cấp file mẫu (Word/Excel) trước khi bắt đầu sprint liên quan.

**Trả lời của khách hàng:** _______________

---

### HQ-04: Có vai trò người dùng thứ ba không?

Hiện tại requirement định nghĩa 2 vai trò: Admin và Nhân viên. Có cần thêm vai trò nào không?

- [ ] Kế toán — chỉ xem báo cáo, không thao tác phiếu
- [ ] Giám đốc / BGĐ — xem dashboard tổng quan, không thao tác
- [ ] Quản lý kho — quyền giữa Admin và Nhân viên
- [ ] Không — chỉ cần 2 vai trò như requirement

> Mỗi vai trò thêm cần +0.5–1 man-day để config phân quyền.

**Trả lời của khách hàng:** _______________

---

### HQ-05: Theo dõi công nợ / thanh toán sau xuất hàng?

Sau khi xuất hàng cho khách, hệ thống có cần:

- **[A]** Không — chỉ ghi nhận tổng tiền phiếu xuất, không theo dõi thanh toán
- **[B]** Có — theo dõi khách đã thanh toán bao nhiêu, còn nợ bao nhiêu
- **[C]** Có — chi tiết hơn: lịch sử từng lần thanh toán, ngày thanh toán

> [B] hoặc [C] sẽ thêm ~8–15 man-days và cần thêm màn hình Quản lý Công nợ.

**Trả lời của khách hàng:** _______________

---

### HQ-06: Dashboard tổng quan có cần không?

- **[A]** Không cần — vào thẳng các màn hình quản lý
- **[B]** Có — cần màn hình tổng quan sau khi đăng nhập

Nếu [B], cần hiển thị thông tin gì? (Đánh dấu):
- [ ] Tổng tồn kho hiện tại
- [ ] Doanh thu hôm nay / tuần / tháng
- [ ] Cảnh báo sản phẩm tồn kho dưới ngưỡng tối thiểu
- [ ] Số phiếu nhập / xuất trong ngày
- [ ] Top sản phẩm xuất nhiều nhất

**Trả lời của khách hàng:** _______________

---

### HQ-07: Dữ liệu cũ có cần migrate không?

Trước khi dùng hệ thống mới, có dữ liệu nào cần import từ hệ thống/file hiện tại không?

- [ ] Danh sách sản phẩm (từ Excel)
- [ ] Danh sách khách hàng (từ Excel)
- [ ] Số lượng tồn kho đầu kỳ
- [ ] Lịch sử phiếu nhập/xuất cũ
- [ ] Không cần — bắt đầu dữ liệu trắng

> Nếu cần migrate: cần cung cấp file mẫu dữ liệu hiện tại. Estimate thêm 3–5 man-days tùy khối lượng.

**Trả lời của khách hàng:** _______________

---

## 🟡 THÔNG THƯỜNG — Làm rõ trong quá trình thiết kế

> Những câu hỏi này không block thiết kế nhưng cần có câu trả lời trước khi code màn hình liên quan.

---

### NQ-01: Khi tách hàng tạo sản phẩm mới — mã sản phẩm mới do ai đặt?

- **[A]** Hệ thống tự sinh mã (SP-001, SP-002...)
- **[B]** Nhân viên nhập tay khi tạo phiếu tách

**Trả lời của khách hàng:** _______________

---

### NQ-02: Cuộn đã tách có thể tách tiếp lần 2 không?

Ví dụ: Cuộn A tách thành A1 + A2. A1 có thể tiếp tục tách thành A1a + A1b không?

- **[A]** Có — tách đệ quy nhiều cấp
- **[B]** Không — chỉ tách 1 lần từ cuộn gốc

**Trả lời của khách hàng:** _______________

---

### NQ-03: Khi tồn kho âm — block hay warning?

Khi nhân viên tạo phiếu xuất vượt tồn hiện có:

- **[A]** Block hoàn toàn — không thể xác nhận phiếu
- **[B]** Hiển thị cảnh báo — chỉ Admin mới có quyền override và xác nhận

*(Requirement đề cập cả 2, cần chốt lại)*

**Trả lời của khách hàng:** _______________

---

### NQ-04: Phiếu điều chỉnh tồn có cần màn hình riêng không?

Admin có thể điều chỉnh tồn thủ công. Cần:

- **[A]** Màn hình "Phiếu điều chỉnh tồn" riêng — có lý do bắt buộc, lưu lịch sử
- **[B]** Nút "Điều chỉnh tồn" nằm trong màn hình chi tiết tồn kho — đơn giản hơn

**Trả lời của khách hàng:** _______________

---

### NQ-05: Quy mô người dùng và hạ tầng

- Số nhân viên sử dụng hệ thống: _____ người
- Số người dùng đồng thời tối đa dự kiến: _____ người
- Nhân viên làm việc: ☐ Một địa điểm  ☐ Nhiều chi nhánh (số lượng: _____)

---

### NQ-06: Format số phiếu tự động

Hệ thống sẽ tự đánh số phiếu. Format mong muốn là gì?

- **[A]** Số thứ tự đơn giản: PN-001, PX-001, PT-001
- **[B]** Có năm: PN-2026-001
- **[C]** Có tháng: PN-202603-001
- **[D]** Format khác: _______________

**Trả lời của khách hàng:** _______________

---

### NQ-07: Yêu cầu bảo mật mật khẩu

- Độ dài mật khẩu tối thiểu: _____ ký tự
- Yêu cầu ký tự đặc biệt / chữ hoa: ☐ Có  ☐ Không
- Mật khẩu hết hạn sau: ☐ Không hết hạn  ☐ _____ ngày
- Khóa tài khoản sau _____ lần đăng nhập sai

---

### NQ-08: Lịch sử giá có cần lưu không?

Khi thay đổi đơn giá gốc hoặc chính sách chiết khấu:

- **[A]** Không cần lưu — chỉ giá hiện tại
- **[B]** Có — lưu lịch sử giá, các phiếu xuất cũ không bị ảnh hưởng

**Trả lời của khách hàng:** _______________

---

### NQ-09: Tích hợp phần mềm bên ngoài

- Hiện tại đang dùng phần mềm kế toán nào? _______________
- Có cần xuất dữ liệu sang phần mềm đó không? ☐ Có  ☐ Không
- Nếu có: định dạng xuất mong muốn: ☐ Excel  ☐ CSV  ☐ API  ☐ Khác: _____

---

### NQ-10: Tài liệu hướng dẫn sử dụng

Sau khi bàn giao hệ thống, có cần:

- [ ] Video hướng dẫn sử dụng
- [ ] Tài liệu PDF hướng dẫn
- [ ] Buổi training trực tiếp cho nhân viên
- [ ] Không cần — tự hướng dẫn nội bộ

---

## 📎 Lưu ý về tài liệu cần cung cấp

Để bắt đầu dự án, khách hàng cần cung cấp:

| Tài liệu | Thời điểm cần | Bắt buộc? |
|---|---|---|
| File mẫu Excel báo cáo NXT | Trước Sprint 4 | ✅ Bắt buộc |
| File mẫu in phiếu (nếu có) | Trước Sprint 2 | Nếu HQ-03 = [B] |
| File dữ liệu cũ cần migrate | Trước Sprint 0 | Nếu HQ-07 có chọn |
| Xác nhận format số phiếu | Trước Sprint 0 | ✅ Bắt buộc |

---

## 📌 Lỗi phát hiện trong tài liệu yêu cầu

> Vui lòng xác nhận lại các điểm sau trong `requirement.md`:

1. **Section 2.3.4 "Tác động đến tồn kho"** xuất hiện hai lần với nội dung y hệt (dòng 193–215 và 216–238). Đây có phải nhầm lẫn không, hay có sự khác biệt nào giữa hai phiên bản?

2. **REQ 2.4.4** đề cập "trừ khi có quyền đặc biệt" khi tồn kho âm — nhưng không định nghĩa "quyền đặc biệt" là gì. Đây có phải quyền của Admin, hay cần tạo vai trò/permission riêng?

---

*Tài liệu này được soạn bởi đội phát triển dựa trên phân tích requirement.md v1.0 ngày 2026-03-28.*
*Phiên bản tiếp theo sẽ được cập nhật sau khi nhận câu trả lời từ khách hàng.*

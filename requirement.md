# 1. GIỚI THIỆU

## Mục tiêu:

Xây dựng hệ thống quản lý kho vận hành thực tế cho doanh nghiệp kinh doanh vật liệu (hàng cuộn, xấp, thùng), bao gồm:

- Quản lý sản phẩm & quy đổi đơn vị
- Quản lý khách hàng & chính sách giá/chiết khấu
- Phiếu nhập – Phiếu xuất – Phiếu tách hàng
- Quản lý tồn kho, báo cáo NXT
- Quản trị tài khoản & phân quyền

# 2. CÁC TÍNH NĂNG CHÍNH

## 2.1 Quản trị tài khoản & Phân quyền (RBAC)

### 2.1.1 Quản lý tài khoản người dùng

- Admin tạo tài khoản mới
- Admin chỉnh sửa thông tin tài khoản
- Admin khóa / mở khóa tài khoản
- Reset mật khẩu cho người dùng
- Người dùng tự đổi mật khẩu
- Quản lý danh sách tài khoản (tìm kiếm, lọc theo vai trò)

### 2.1.2 Phân quyền theo vai trò

Các vai trò cơ bản:

- Admin
  - Toàn quyền hệ thống
  - Quản lý tài khoản
  - Điều chỉnh tồn
  - Chỉnh sửa thông tin phiếu

- Nhân viên nhập hàng
  - Tạo phiếu nhập
  - Tạo phiếu xuất
  - Tạo phiếu tách hàng

## 2.2 Quản lý danh mục

Phân hệ Quản lý danh mục là nơi quản lý toàn bộ dữ liệu nền của hệ thống, bao gồm Sản phẩm, Khách hàng và Chính sách giá/Chiết khấu. Đây là dữ liệu cốt lõi phục vụ cho việc lập phiếu nhập, phiếu xuất và tính toán tồn kho.

### 2.2.1 Sản phẩm

Phân hệ Quản lý sản phẩm cho phép tạo, cập nhật và quản lý thông tin chi tiết của từng mã hàng trong kho.

Thông tin sản phẩm gồm:

- Mã sản phẩm
- Tên sản phẩm
- Nhóm hàng
- Đơn vị tính chính (cuộn / xấp / thùng / kg / m2)

- Thuộc tính hàng cuộn:
  - Khổ
  - Mét/cuộn
  - Kg/cuộn

- Thiết lập quy đổi đơn vị:
  - Cuộn ↔ m2 ↔ kg

#### Chức năng thao tác:

Nhân viên có quyền:

- Tạo mới sản phẩm
- Chỉnh sửa thông tin sản phẩm
- Xem danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm

Nhân viên không có quyền:

- Xoá sản phẩm
- Thay đổi quy tắc tính giá hoặc chiết khấu

Admin có quyền:

- Thêm mới sản phẩm
- Chỉnh sửa sản phẩm
- Xoá sản phẩm (nếu chưa phát sinh giao dịch)
- Điều chỉnh cấu hình quy đổi đơn vị
- Thiết lập hoặc thay đổi các thông số liên quan đến tính giá

### 2.2.2 Khách hàng

Phân hệ Quản lý khách hàng cho phép lưu trữ và quản lý thông tin khách mua hàng, phục vụ cho việc lập phiếu xuất và áp dụng chính sách giá.

Thông tin khách hàng bao gồm:

- Mã khách
- Tên khách
- Thông tin liên hệ:
  - Địa chỉ
  - Số điện thoại
  - Email
- Ghi chú

#### Chức năng thao tác:

Nhân viên có quyền:

- Tạo mới khách hàng
- Chỉnh sửa thông tin khách hàng
- Xem danh sách khách hàng
- Tìm kiếm khách hàng theo tên hoặc mã

Không có quyền:

- Xoá khách hàng
- Thay đổi chính sách chiết khấu

Admin có quyền:

- Thêm mới khách hàng
- Chỉnh sửa khách hàng
- Xoá khách hàng (nếu chưa có giao dịch)
- Cấu hình chính sách giá và chiết khấu cho từng khách

### 2.2.3 Bảng giá & Chiết khấu theo khách hàng

Phân hệ này cho phép cấu hình chính sách giá linh hoạt, đảm bảo hệ thống tự động tính giá chính xác khi lập phiếu xuất.

Hình thức chiết khấu hỗ trợ:

- Không giảm giá
- Giảm theo %

  - Áp dụng cho tất cả sản phẩm
  - Hoặc áp dụng cho từng sản phẩm

- Giảm theo số tiền (VND)

  - Áp dụng cho tất cả sản phẩm
  - Hoặc áp dụng cho từng sản phẩm

Quy tắc tính giá:

1. Nếu có chiết khấu theo từng sản phẩm → áp dụng mức đó.
2. Nếu không có theo từng sản phẩm → áp dụng chiết khấu chung.
3. Nếu không có chiết khấu → dùng đơn giá gốc.

## 2.3 Phiếu nhập hàng

Phân hệ Phiếu nhập hàng cho phép ghi nhận số lượng hàng hóa nhập vào kho, làm cơ sở cập nhật tồn kho và phục vụ báo cáo NXT.

### 2.3.1 Trang danh sách phiếu nhập

Hệ thống cung cấp màn hình danh sách phiếu nhập với các chức năng quản lý và tra cứu.

Tính năng hỗ trợ:

- Tạo phiếu nhập
- Lọc theo:
  - Khoảng thời gian (từ ngày – đến ngày)
  - Người lập
- Sắp xếp
- Tìm kiếm

### 2.3.2 Trang chi tiết phiếu nhập

Mỗi phiếu nhập có một trang chi tiết hiển thị đầy đủ thông tin.

Thông tin chung:

- Số phiếu nhập (tự động đánh số)
- Ngày nhập
- Người lập
- Danh sách sản phẩm nhập
- Ghi chú

### 2.3.3 Quyền thao tác

Nhân viên có quyền:

- Tạo mới phiếu nhập
- Thêm / chỉnh sửa dòng sản phẩm khi phiếu ở trạng thái Nháp
- Lưu phiếu ở trạng thái Nháp
- Xác nhận phiếu nhập

Nhân viên Không có quyền:

- Xoá phiếu đã xác nhận
- Sửa phiếu sau khi đã xác nhận

Admin có toàn quyền:

- Tạo mới phiếu nhập
- Chỉnh sửa phiếu nhập (kể cả sau khi xác nhận, nếu cần)
- Xoá phiếu nhập

### 2.3.4 Tác động đến tồn kho

Phiếu nhập có ảnh hưởng trực tiếp đến số lượng tồn kho.

Khi phiếu ở trạng thái Nháp:

- Không cập nhật tồn kho.
- Chỉ lưu dữ liệu tạm thời.

Khi xác nhận phiếu:

- Hệ thống cộng số lượng nhập vào tồn kho theo từng mã sản phẩm.
- Nếu sản phẩm có quy đổi đơn vị, hệ thống tự động cập nhật tồn theo đơn vị chuẩn.

Khi chỉnh sửa phiếu đã xác nhận (Admin):

- Hệ thống tính toán phần chênh lệch.
- Cập nhật lại tồn kho tương ứng.

Khi xoá phiếu đã xác nhận (Admin):

- Hệ thống trừ lại toàn bộ số lượng đã nhập khỏi tồn kho.


## 2.4 Phiếu xuất hàng

Phân hệ Phiếu xuất hàng cho phép ghi nhận việc xuất hàng bán cho khách, đồng thời cập nhật tồn kho và doanh thu.

### 2.4.1 Trang danh sách phiếu xuất

Hệ thống cung cấp màn hình danh sách phiếu xuất với các chức năng quản lý và tra cứu.

**Thông tin hiển thị trên danh sách:**

- Số phiếu xuất
- Ngày lập phiếu
- Khách hàng
- Người lập
- Tổng tiền
- Trạng thái (Nháp / Đã xác nhận / Đã huỷ)
- Ghi chú (rút gọn)

**Tính năng hỗ trợ:**

- Tạo phiếu xuất
- Lọc theo:
  - Khoảng thời gian (từ ngày – đến ngày)
  - Khách hàng
  - Người lập
- Sắp xếp
- Tìm kiếm

### 2.4.2 Trang chi tiết phiếu xuất

Mỗi phiếu xuất có trang chi tiết bao gồm đầy đủ thông tin giao dịch.

**Thông tin chung:**

- Số phiếu xuất (tự động đánh số)
- Ngày xuất
- Khách hàng (có thể chọn khách cũ hoặc tạo mới)
- Người lập
- Ghi chú
- Trạng thái (Nháp / Đã xác nhận / Đã huỷ)

**Danh sách dòng sản phẩm**

Mỗi dòng bao gồm:

- Mã sản phẩm
- Tên sản phẩm
- Đơn vị tính
- Số lượng xuất
- Đơn giá gốc
- Loại chiết khấu (nếu có)
- Giá trị chiết khấu
- Đơn giá sau chiết khấu
- Thành tiền

### 2.4.3 Quy trình tính giá tự động

Khi nhân viên chọn khách hàng và sản phẩm, hệ thống tự động:

- Lấy đơn giá từ bảng giá sản phẩm.
- Kiểm tra cấu hình chiết khấu của khách hàng.
- Áp dụng chiết khấu theo thứ tự ưu tiên:
  - Nếu có chiết khấu theo từng sản phẩm → áp dụng mức đó.
  - Nếu không có theo từng sản phẩm → áp dụng mức chiết khấu chung.
  - Nếu không có chiết khấu → sử dụng đơn giá gốc.
- Tính đơn giá sau chiết khấu.
- Tính thành tiền từng dòng.
- Tính tổng tiền toàn bộ phiếu.

### 2.4.4 Kiểm tra tồn kho

Trước khi xác nhận phiếu xuất:

- Hệ thống kiểm tra tồn kho theo từng mã sản phẩm.
- Nếu số lượng xuất lớn hơn tồn hiện có:
  - Hiển thị cảnh báo.
  - Không cho phép xác nhận (trừ khi có quyền đặc biệt).

### 2.4.5 Quyền thao tác

**Nhân viên có quyền:**

- Tạo mới phiếu xuất
- Chỉnh sửa phiếu khi ở trạng thái Nháp
- Thêm/xoá dòng sản phẩm khi chưa xác nhận
- Xác nhận phiếu xuất

**Nhân viên không có quyền:**

- Sửa đơn giá gốc (nếu không được phân quyền)
- Sửa hoặc xoá phiếu đã xác nhận

**Admin có toàn quyền:**

- Tạo, sửa, xoá phiếu xuất
- Chỉnh sửa phiếu sau khi xác nhận (hệ thống tự điều chỉnh tồn)
- Huỷ phiếu xuất
- Điều chỉnh giá hoặc chiết khấu nếu cần

### 2.4.6 Tác động đến tồn kho

Phiếu xuất ảnh hưởng trực tiếp đến số lượng tồn kho.

**Khi phiếu ở trạng thái Nháp:**

- Không trừ tồn kho.

**Khi xác nhận phiếu:**

- Hệ thống trừ số lượng xuất khỏi tồn kho.
- Nếu có quy đổi đơn vị, hệ thống tự động tính toán theo đơn vị chuẩn.

**Khi chỉnh sửa phiếu đã xác nhận (Admin):**

- Hệ thống tính toán phần chênh lệch.
- Cập nhật tồn kho tương ứng.

**Khi huỷ hoặc xoá phiếu đã xác nhận:**

- Hệ thống hoàn lại số lượng đã trừ vào tồn kho.

## 2.5 Phiếu tách hàng

Phân hệ Phiếu tách hàng được sử dụng trong trường hợp cần cắt một cuộn hàng thành nhiều phần, phục vụ xuất hàng từng phần hoặc quản lý phần dư (cuộn lẻ).

Tính năng này đặc biệt áp dụng cho hàng cuộn có đơn vị quy đổi như cuộn ↔ m2 ↔ kg.

Phiếu tách hàng không làm thay đổi tổng tồn kho, mà chỉ thay đổi cấu trúc tồn từ một sản phẩm ban đầu tách thành nhiều sản phẩm nhỏ (có thể tạo sản phẩm mới)

### 2.5.1 Trang danh sách phiếu tách hàng

Hệ thống cung cấp màn hình danh sách phiếu tách để quản lý và tra cứu

**Thông tin hiển thị:**

- Số phiếu tách
- Ngày lập
- Sản phẩm
- Cuộn gốc
- Tổng số lượng đã tách
- Người lập
- Trạng thái (Nháp / Đã xác nhận / Đã huỷ)

**Tính năng hỗ trợ:**

- Lọc theo:
  - Khoảng thời gian
  - Mã sản phẩm
  - Trạng thái
  - Người lập
- Sắp xếp
- Tìm kiếm

### 2.5.2 Trang chi tiết phiếu tách hàng

**Thông tin chung:**

- Số phiếu tách (tự động đánh số)
- Ngày thực hiện
- Người lập
- Ghi chú
- Trạng thái

**Thông tin sản phẩm gốc:**

- Mã sản phẩm
- Đơn vị tính
- Số lượng ban đầu
- Tồn hiện tại

**Thông tin tách:**

- Số lượng tách ra
- Số lượng còn lại
- Thông tin các sản phẩm tách thành (có thể tạo sản phẩm mới)

### 2.5.3 Tác động đến tồn kho

**Khi phiếu ở trạng thái Nháp:**

- Không thay đổi tồn kho.

**Khi xác nhận phiếu:**

- Không thay đổi tổng tồn kho.
- Chỉ cập nhật:
  - Giảm số lượng của cuộn gốc
  - Tăng số lượng các sản phẩm tách (đã tồn tại hoặc mới tạo)

**Khi huỷ hoặc xoá phiếu đã xác nhận (Admin):**

- Hệ thống hoàn nguyên trạng thái cuộn gốc.
- Xoá sản phẩm mới tạo

### 2.5.4 Quyền thao tác

**Nhân viên có quyền:**

- Tạo phiếu tách
- Chỉnh sửa khi ở trạng thái Nháp
- Xác nhận phiếu

**Nhân viên không có quyền:**

- Sửa phiếu đã xác nhận
- Xoá phiếu đã xác nhận

**Admin có toàn quyền:**

- Tạo / sửa / xoá phiếu tách
- Hoàn tác phiếu đã xác nhận
- Điều chỉnh tồn nếu cần

## 2.6 Quản lý tồn kho

Phân hệ Quản lý tồn kho chịu trách nhiệm tính toán và theo dõi chính xác số lượng hàng hóa trong kho dựa trên các giao dịch phát sinh (phiếu nhập, phiếu xuất, phiếu tách hàng, điều chỉnh tồn).

Tồn kho được tính toán tự động và không cho phép nhập thủ công (ngoại trừ điều chỉnh bởi Admin).

### 2.6.1 Trang bảng tồn kho (Tổng hợp)

Hệ thống cung cấp màn hình Bảng tồn kho tổng hợp, hiển thị tồn của tất cả sản phẩm.

**Thông tin hiển thị:**

- Mã sản phẩm
- Tên sản phẩm
- Nhóm hàng
- Tồn hiện tại theo đơn vị chính
- Tồn quy đổi (cuộn / m2 / kg nếu có)

**Tính năng hỗ trợ:**

- Tìm kiếm theo mã sản phẩm / tên sản phẩm
- Lọc theo nhóm hàng
- Sắp xếp
- Xuất PDF bảng tồn theo mẫu chuẩn

### 2.6.2 Trang chi tiết tồn kho theo sản phẩm

Khi người dùng chọn một sản phẩm từ bảng tồn, hệ thống mở trang chi tiết tồn kho của sản phẩm đó.

#### 1. Thông tin tổng quan

- Mã sản phẩm
- Tên sản phẩm
- Nhóm hàng
- Tồn hiện tại
- Đơn vị tính

#### 2. Lịch sử thay đổi tồn kho (Stock Movement History)

Trang hiển thị toàn bộ lịch sử biến động của sản phẩm theo thời gian.

**Thông tin trong bảng lịch sử:**

- Thời gian
- Loại giao dịch:
  - Nhập kho
  - Xuất kho
  - Tách
  - Điều chỉnh tồn
- Số phiếu liên quan
- Số lượng thay đổi (+ / -)
- Tồn sau giao dịch
- Người thực hiện
- Ghi chú

**Tính năng hỗ trợ:**

- Lọc theo khoảng thời gian
- Lọc theo loại giao dịch
- Sắp xếp

### 2.6.3 Nguyên tắc cập nhật tồn

**Khi xác nhận phiếu nhập:**

- Cộng số lượng vào tồn kho.

**Khi xác nhận phiếu xuất:**

- Trừ số lượng khỏi tồn kho.

**Khi điều chỉnh tồn:**

- Cập nhật trực tiếp theo số lượng điều chỉnh.
- Bắt buộc nhập lý do.

**Khi chỉnh sửa hoặc huỷ phiếu đã xác nhận:**

- Hệ thống tính toán phần chênh lệch.
- Cập nhật lại tồn tương ứng.

### 2.6.4 Kiểm soát nhất quán dữ liệu

- Chỉ phiếu ở trạng thái "Đã xác nhận" mới tác động đến tồn.
- Không cập nhật tồn hai lần cho cùng một giao dịch.
- Mọi thao tác thay đổi tồn đều được ghi log.


# 3. Các yêu cầu khác:
- Mã phiếu đơn xuất, nhập, tách được auto generate theo format
  - Phiếu xuất: PX-yyyymm-n
  - Phiếu nhập: PN-yyyymm-n
  - Phiếu tách: PT-yyyymm-n
Với PX, PN, PT là prefix tương ứng với từng loại phiếu, yyyy là năm, mm là tháng, n là là increment count theo từng đơn trong tháng, reset sau mỗi tháng
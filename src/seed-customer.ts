import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/database/prisma.service";
import { CustomerType, CustomerStatus } from "@prisma/client";

const customers = [
  {
    code: "KH001",
    name: "Công ty TNHH Giải Pháp In Ấn Minh Hoàng",
    type: CustomerType.ENTERPRISE,
    status: CustomerStatus.ACTIVE,
    companyName: "Công ty TNHH Giải Pháp In Ấn Minh Hoàng",
    taxCode: "0102030405",
    contactPerson: "Nguyễn Văn A",
    address: "123 Đường Láng, Đống Đa, Hà Nội",
    billingAddress: "123 Đường Láng, Đống Đa, Hà Nội",
    shippingAddress: "Lô B2 Cụm CN Từ Liêm, Hà Nội",
    phone: "0912345678",
    email: "inminhhoang@gmail.com",
    note: "Khách hàng doanh nghiệp lớn ngành in, thanh toán đúng hạn.",
  },
  {
    code: "KH002",
    name: "Đại lý Decal Quảng Cáo Tiến Phát",
    type: CustomerType.AGENCY,
    status: CustomerStatus.ACTIVE,
    companyName: "Đại lý Decal Quảng Cáo Tiến Phát",
    taxCode: "0304050607",
    contactPerson: "Trần Thị B",
    address: "456 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    billingAddress: "456 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    shippingAddress: "456 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    phone: "0987654321",
    email: "decaltienphat@gmail.com",
    note: "Đại lý phân phối decal khu vực phía Nam.",
  },
  {
    code: "KH003",
    name: "Cửa Hàng Quà Tặng Lưu Niệm Trí Đức",
    type: CustomerType.RETAIL,
    status: CustomerStatus.ACTIVE,
    companyName: "Hộ kinh doanh Trí Đức",
    taxCode: "8123456789",
    contactPerson: "Phạm Văn C",
    address: "789 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    billingAddress: "789 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    shippingAddress: "789 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    phone: "0904445556",
    email: "quaductri@gmail.com",
    note: "Khách lẻ mua ly sứ in hình, lấy hàng trực tiếp.",
  },
  {
    code: "KH004",
    name: "Công ty Cổ phần Quảng cáo Truyền thông RedSun",
    type: CustomerType.VIP,
    status: CustomerStatus.ACTIVE,
    companyName: "Công ty Cổ phần Quảng cáo Truyền thông RedSun",
    taxCode: "0109876543",
    contactPerson: "Lê Hoàng Dũng",
    address: "101 Hoàng Hoa Thám, Ba Đình, Hà Nội",
    billingAddress: "101 Hoàng Hoa Thám, Ba Đình, Hà Nội",
    shippingAddress: "Lô 5 KCN Quang Minh, Mê Linh, Hà Nội",
    phone: "0936123456",
    email: "purchasing@redsun.vn",
    note: "Khách hàng VIP, chiết khấu đặc biệt.",
  },
  {
    code: "KH005",
    name: "Công ty Cổ phần Bao bì & In ấn Hải Nam",
    type: CustomerType.ENTERPRISE,
    status: CustomerStatus.ACTIVE,
    companyName: "Công ty Cổ phần Bao bì & In ấn Hải Nam",
    taxCode: "0104567890",
    contactPerson: "Phạm Minh Tuấn",
    address: "Lô C3, KCN Quế Võ, Bắc Ninh",
    billingAddress: "Lô C3, KCN Quế Võ, Bắc Ninh",
    shippingAddress: "Lô C3, KCN Quế Võ, Bắc Ninh",
    phone: "0976555123",
    email: "hainampackaging@gmail.com",
    note: "Khách hàng doanh nghiệp lớn đối tác lâu năm.",
  },
  {
    code: "KH006",
    name: "Đại lý Phân phối Vật liệu Quảng cáo Ánh Dương",
    type: CustomerType.AGENCY,
    status: CustomerStatus.ACTIVE,
    companyName: "Công ty TNHH Ánh Dương AD",
    taxCode: "0312348888",
    contactPerson: "Lê Thu Thủy",
    address: "88 Song Hành, Quận 2, TP. Hồ Chí Minh",
    billingAddress: "88 Song Hành, Quận 2, TP. Hồ Chí Minh",
    shippingAddress: "Kho trung chuyển Ánh Dương, Hóc Môn, TP. HCM",
    phone: "0918999777",
    email: "anhduongad@gmail.com",
    note: "Đại lý phân phối màng bạt hiflex miền Nam.",
  },
  {
    code: "KH007",
    name: "Cửa hàng In ấn & Photocopy Thành Công",
    type: CustomerType.RETAIL,
    status: CustomerStatus.ACTIVE,
    companyName: "Hộ kinh doanh Nguyễn Thành Công",
    taxCode: "8209876541",
    contactPerson: "Nguyễn Thành Công",
    address: "15 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    billingAddress: "15 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    shippingAddress: "15 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    phone: "0963222111",
    email: "photothanhcong@gmail.com",
    note: "Khách hàng in ấn quảng cáo quy mô nhỏ lẻ.",
  },
  {
    code: "KH008",
    name: "Tập đoàn Vingroup (Bộ phận Sự kiện)",
    type: CustomerType.VIP,
    status: CustomerStatus.ACTIVE,
    companyName: "Tập đoàn Vingroup - Công ty CP",
    taxCode: "0102016723",
    contactPerson: "Đỗ Mai Hương",
    address: "Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội",
    billingAddress:
      "Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội",
    shippingAddress: "Trung tâm Hội nghị Almaz, Long Biên, Hà Nội",
    phone: "0909998887",
    email: "v.huongdm@vingroup.net",
    note: "Khách hàng VIP dự án sự kiện quy mô lớn.",
  },
  {
    code: "KH009",
    name: "Công ty TNHH Quảng cáo & Truyền thông IdeaPlus",
    type: CustomerType.ENTERPRISE,
    status: CustomerStatus.INACTIVE,
    companyName: "Công ty TNHH Quảng cáo & Truyền thông IdeaPlus",
    taxCode: "0316543210",
    contactPerson: "Vũ Anh Tuấn",
    address: "246 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh",
    billingAddress: "246 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh",
    shippingAddress: "246 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh",
    phone: "0988777666",
    email: "contact@ideaplus.vn",
    note: "Tạm dừng giao dịch do đang cơ cấu lại doanh nghiệp.",
  },
  {
    code: "KH010",
    name: "Xưởng tranh Canvas Decor Decor",
    type: CustomerType.RETAIL,
    status: CustomerStatus.ACTIVE,
    companyName: "Hộ kinh doanh Tranh Canvas Hà Nội",
    taxCode: "8311223344",
    contactPerson: "Trần Bảo Ngọc",
    address: "50 Tây Sơn, Đống Đa, Hà Nội",
    billingAddress: "50 Tây Sơn, Đống Đa, Hà Nội",
    shippingAddress: "50 Tây Sơn, Đống Đa, Hà Nội",
    phone: "0945112233",
    email: "decorcanvas@gmail.com",
    note: "Xưởng làm tranh trang trí canvas, nhập giấy ảnh cuộn thường xuyên.",
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log("Starting customer seeding...");

  try {
    for (const customer of customers) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { code: customer.code },
      });

      if (existingCustomer) {
        console.log(`✅ Customer [${customer.code}] already exists. Skipping.`);
      } else {
        await prisma.customer.create({
          data: {
            code: customer.code,
            name: customer.name,
            type: customer.type,
            status: customer.status,
            companyName: customer.companyName,
            taxCode: customer.taxCode,
            contactPerson: customer.contactPerson,
            address: customer.address,
            billingAddress: customer.billingAddress,
            shippingAddress: customer.shippingAddress,
            phone: customer.phone,
            email: customer.email,
            note: customer.note,
          },
        });
        console.log(
          `🎉 Successfully created customer: [${customer.code}] - ${customer.name}`,
        );
      }
    }
    console.log("✨ Customer seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding customers:", error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/database/prisma.service";

const categories = [
  {
    code: "PP_MANG_DECAL",
    name: "Màng PP / PVC Decal",
  },
  {
    code: "LY",
    name: "Ly sứ / Ly lồng màu",
  },
  {
    code: "GIAY_ANH_CUON",
    name: "Giấy ảnh cuộn",
  },
  {
    code: "GIAY_ANH_XAP",
    name: "Giấy ảnh xấp",
  },
  {
    code: "RUOT_PVC_VIEN",
    name: "Ruột PVC / Viền",
  },
  {
    code: "HIFLEX",
    name: "Bạt Hiflex",
  },
];

async function bootstrap() {
  // Create a standalone application context (does not start an HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);

  console.log("Starting category seeding...");

  try {
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { code: category.code },
      });

      if (existingCategory) {
        console.log(`✅ Category [${category.code}] already exists. Skipping.`);
      } else {
        await prisma.category.create({
          data: {
            code: category.code,
            name: category.name,
          },
        });
        console.log(
          `🎉 Successfully created category: [${category.code}] - ${category.name}`,
        );
      }
    }
    console.log("✨ Category seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
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

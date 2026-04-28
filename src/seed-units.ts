import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/database/prisma.service";

const units = [
  { code: "cai", label: "Cái" },
  { code: "cuon", label: "Cuộn" },
  { code: "kg", label: "Kilogram" },
  { code: "m", label: "Mét" },
  { code: "m2", label: "Mét vuông" },
  { code: "thung", label: "Thùng" },
  { code: "to", label: "Tờ" },
  { code: "xap", label: "Xấp" },
];

async function bootstrap() {
  // Create a standalone application context (does not start an HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);

  console.log("Starting unit seeding...");

  try {
    for (const unit of units) {
      const result = await prisma.unit.upsert({
        where: { code: unit.code },
        update: { label: unit.label },
        create: {
          code: unit.code,
          label: unit.label,
        },
      });
      console.log(
        `🎉 Successfully upserted unit: [${result.code}] - ${result.label}`,
      );
    }
    console.log("✨ Unit seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding units:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

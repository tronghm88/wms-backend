import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/database/prisma.service";
import { Decimal } from "decimal.js";
import products from "./data/products.seed";

/**
 * Seeds the product catalogue from `src/data/products.seed.ts`, which is
 * generated from `docs/nhap-xuat-ton.xlsx` by `scripts/parse-stock-xlsx.py`.
 *
 * Each row of the monthly nhập-xuất-tồn report is one product. The product
 * `name` is the merged group name; the per-row variant lives in `specText`;
 * `length`/`width` are filled only for sheets that carry real dimensions.
 * Closing stock seeds the initial inventory quantity. The report has no price
 * column, so `basePrice` is 0 and `costPrice` is null. Unit-conversion factors
 * (m / m2 / kg / to) come straight from the report columns.
 *
 * Re-running is safe: products are upserted by `code`, and existing inventory
 * quantities are preserved (only created when absent) so app activity is not
 * clobbered.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  try {
    console.log(`📦 Loaded ${products.length} products from seed data.`);

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((c) => [c.code, c.id]));

    const units = await prisma.unit.findMany();
    const unitCodes = new Set(units.map((u) => u.code));

    let successCount = 0;
    let skipCount = 0;

    for (const item of products) {
      const categoryId = categoryMap.get(item.categoryCode);
      if (!categoryId) {
        console.warn(
          `⚠️ Skip [${item.code}]: category [${item.categoryCode}] not found.`,
        );
        skipCount++;
        continue;
      }
      if (!unitCodes.has(item.baseUnit)) {
        console.warn(
          `⚠️ Skip [${item.code}]: base unit [${item.baseUnit}] not found.`,
        );
        skipCount++;
        continue;
      }

      const length = item.length != null ? new Decimal(item.length) : null;
      const width = item.width != null ? new Decimal(item.width) : null;
      const specText = item.specText ? item.specText.slice(0, 100) : null;
      const basePrice = new Decimal(item.basePrice); // 0 — no price in source

      const product = await prisma.product.upsert({
        where: { code: item.code },
        update: {
          name: item.name,
          categoryId,
          baseUnit: item.baseUnit,
          basePrice,
          costPrice: null,
          length,
          width,
          specText,
        },
        create: {
          code: item.code,
          name: item.name,
          categoryId,
          baseUnit: item.baseUnit,
          basePrice,
          costPrice: null,
          length,
          width,
          specText,
        },
      });

      // Seed inventory with the report's closing stock — only on first create
      // so re-seeding never clobbers quantities the app has since changed.
      await prisma.inventory.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          quantity: new Decimal(item.initialStock),
          unitCode: item.baseUnit,
        },
      });

      // Unit conversions (no unique key on the triple, so find-then-write).
      for (const conv of item.conversions) {
        if (!unitCodes.has(conv.toUnit)) continue;
        const factor = new Decimal(conv.factor);
        const existing = await prisma.unitConversion.findFirst({
          where: {
            productId: product.id,
            fromUnit: item.baseUnit,
            toUnit: conv.toUnit,
          },
        });
        if (existing) {
          await prisma.unitConversion.update({
            where: { id: existing.id },
            data: { factor },
          });
        } else {
          await prisma.unitConversion.create({
            data: {
              productId: product.id,
              fromUnit: item.baseUnit,
              toUnit: conv.toUnit,
              factor,
            },
          });
        }
      }

      successCount++;
      if (successCount % 100 === 0) {
        console.log(`✅ Progress: ${successCount} products...`);
      }
    }

    console.log(`\n✨ Seeding completed!`);
    console.log(`🎉 Seeded: ${successCount} products`);
    console.log(`⚠️ Skipped: ${skipCount} products`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
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

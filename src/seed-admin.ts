import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/database/prisma.service";
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from "./domain/contracts/password-hasher.interface";
import { UserRole } from "@prisma/client";

async function bootstrap() {
  // Create a standalone application context (does not start an HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const hasher = app.get<IPasswordHasher>(PASSWORD_HASHER);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME ?? "superadmin";

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌ ADMIN_EMAIL and ADMIN_PASSWORD must be provided in the environment.",
    );
    process.exit(1);
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user ${adminEmail} already exists. Skipping seed.`);
    } else {
      const passwordHash = await hasher.hash(adminPassword);

      await prisma.user.create({
        data: {
          email: adminEmail,
          username: adminUsername,
          passwordHash: passwordHash,
          fullName: "Super Admin",
          role: UserRole.SUPER_ADMIN,
          customPermissions: [], // Use hardcoded role permissions
        },
      });
      console.log(`🎉 Successfully created SUPER_ADMIN account: ${adminEmail}`);
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

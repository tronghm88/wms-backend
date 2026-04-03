import { Module } from "@nestjs/common";
import { AppController } from "./presentation/controllers/app.controller";
import { AppService } from "./application/use-cases/app.service";
import { PrismaModule } from "./infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

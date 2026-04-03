import { Module } from "@nestjs/common";
import { UsersController } from "../../presentation/controllers/users.controller";
import { PermissionsController } from "../../presentation/controllers/permissions.controller";
import { CreateUserUseCase } from "../../application/use-cases/users/create-user.use-case";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../database/prisma.module";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UsersController, PermissionsController],
  providers: [CreateUserUseCase],
})
export class UsersModule {}

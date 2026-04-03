import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { User as PrismaUser } from "@prisma/client";
import { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import {
  UserEntity,
  UserRole,
  UserStatus,
} from "../../../domain/entities/user.entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: PrismaUser): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.passwordHash,
      user.fullName,
      user.role as UserRole,
      user.customPermissions,
      user.status as UserStatus,
      user.lastLoginAt,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return this.mapToDomain(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}

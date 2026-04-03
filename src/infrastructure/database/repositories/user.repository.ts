import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { User as PrismaUser } from "@prisma/client";
import { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import {
  UserEntity
} from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/enums";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapToDomain(user: PrismaUser): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      role: user.role as UserRole,
      customPermissions: user.customPermissions,
      status: user.status as UserStatus,
      lastLoginAt: user.lastLoginAt ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return this.mapToDomain(user);
  }

  async create(
    user: Omit<UserEntity, "id" | "createdAt" | "updatedAt" | "isActive">,
  ): Promise<UserEntity> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        role: user.role,
        customPermissions: user.customPermissions ?? undefined,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      },
    });
    return this.mapToDomain(createdUser);
  }

  async update(
    userId: number,
    data: Partial<
      Omit<
        UserEntity,
        "id" | "createdAt" | "updatedAt" | "isActive" | "passwordHash"
      >
    >,
  ): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        role: data.role,
        customPermissions: data.customPermissions ?? undefined,
        status: data.status,
      },
    });
    return this.mapToDomain(updatedUser);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }
}

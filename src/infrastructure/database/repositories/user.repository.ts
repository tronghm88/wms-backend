import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, User as PrismaUser } from "@prisma/client";
import {
  FindUsersParams,
  IUserRepository,
  UserStats,
} from "../../../domain/contracts/user.repository.interface";
import { UserEntity } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/enums";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: PrismaUser): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      phone: user.phone ?? null,
      note: user.note ?? null,
      role: user.role as UserRole,
      customPermissions: user.customPermissions,
      status: user.status as UserStatus,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findAndCount(params: FindUsersParams): Promise<[UserEntity[], number]> {
    const { skip, take, search, role, sortBy, sortOrder } = params;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return [users.map((user) => this.mapToDomain(user)), total];
  }

  async getStats(): Promise<UserStats> {
    const result = await this.prisma.$queryRaw<
      Array<{
        total_users: bigint;
        active_users: bigint;
        inactive_users: bigint;
        admin_count: bigint;
        staff_count: bigint;
      }>
    >`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_users,
        COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive_users,
        COUNT(*) FILTER (WHERE role IN ('ADMIN', 'SUPER_ADMIN')) as admin_count,
        COUNT(*) FILTER (WHERE role = 'WAREHOUSE_STAFF') as staff_count
      FROM "users"
    `;

    const stats = result[0];

    return {
      totalUsers: Number(stats?.total_users || 0),
      activeUsers: Number(stats?.active_users || 0),
      inactiveUsers: Number(stats?.inactive_users || 0),
      adminCount: Number(stats?.admin_count || 0),
      staffCount: Number(stats?.staff_count || 0),
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
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
        username: user.username,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        note: user.note,
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
        username: data.username,
        fullName: data.fullName,
        phone: data.phone,
        note: data.note,
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

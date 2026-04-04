import { UserEntity } from "../entities/user.entity";
import { UserRole } from "../enums";

export const USER_REPOSITORY = "USER_REPOSITORY";

export interface FindUsersParams {
  skip: number;
  take: number;
  search?: string;
  role?: UserRole;
  sortBy: "createdAt" | "email" | "fullName";
  sortOrder: "asc" | "desc";
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  findAndCount(params: FindUsersParams): Promise<[UserEntity[], number]>;
  create(
    user: Omit<UserEntity, "id" | "createdAt" | "updatedAt" | "isActive">,
  ): Promise<UserEntity>;
  update(
    userId: number,
    data: Partial<
      Omit<
        UserEntity,
        "id" | "createdAt" | "updatedAt" | "isActive" | "passwordHash"
      >
    >,
  ): Promise<UserEntity>;
  updateLastLogin(userId: number): Promise<void>;
  updatePassword(userId: number, newPasswordHash: string): Promise<void>;
}

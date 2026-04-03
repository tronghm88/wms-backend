import { UserEntity } from "../entities/user.entity";

export const USER_REPOSITORY = "USER_REPOSITORY";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
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

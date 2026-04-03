import { UserEntity } from "../entities/user.entity";

export const USER_REPOSITORY = "USER_REPOSITORY";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  updateLastLogin(userId: string): Promise<void>;
}

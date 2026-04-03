/* eslint-disable @typescript-eslint/unbound-method */
import { AdminResetPasswordUseCase } from "./admin-reset-password.use-case";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import {
  UserEntity,
  UserRole,
  UserStatus,
} from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import { ICacheService } from "../../../domain/contracts/cache.service.interface";

describe("AdminResetPasswordUseCase", () => {
  let useCase: AdminResetPasswordUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockCacheService: jest.Mocked<ICacheService>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    mockPasswordHasher = {
      hash: jest.fn(),
    } as unknown as jest.Mocked<IPasswordHasher>;
    mockCacheService = {
      del: jest.fn(),
    } as unknown as jest.Mocked<ICacheService>;
    useCase = new AdminResetPasswordUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockCacheService,
    );
  });

  it("should successfully reset a user password by admin", async () => {
    const userId = "user-123";
    const request = {
      userId,
      newPasswordRaw: "NewSecurePass123",
    };

    const existingUser = new UserEntity(
      userId,
      "staff@example.com",
      "old-hash",
      "Staff User",
      UserRole.WAREHOUSE_STAFF,
      null,
      UserStatus.ACTIVE,
      null,
      new Date(),
      new Date(),
    );

    mockUserRepository.findById.mockResolvedValue(existingUser);
    mockPasswordHasher.hash.mockResolvedValue("new-hash");

    await useCase.execute(request);

    expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
      userId,
      "new-hash",
    );
    expect(mockCacheService.del).toHaveBeenCalledWith(
      `session:user_data:${userId}`,
    );
    expect(mockCacheService.del).toHaveBeenCalledWith(
      `session:refresh_token:${userId}`,
    );
  });

  it("should throw UserNotFoundException if user does not exist", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: "nonexistent", newPasswordRaw: "pass" }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it("should throw CannotModifySuperAdminException if target is SUPER_ADMIN", async () => {
    const userId = "super-admin-id";
    const existingUser = new UserEntity(
      userId,
      "super@example.com",
      "hash",
      "Super Admin",
      UserRole.SUPER_ADMIN,
      null,
      UserStatus.ACTIVE,
      null,
      new Date(),
      new Date(),
    );

    mockUserRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ userId, newPasswordRaw: "pass" }),
    ).rejects.toThrow(CannotModifySuperAdminException);
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { AdminResetPasswordUseCase } from "../../../../src/application/use-cases/users/admin-reset-password.use-case";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
} from "../../../../src/domain/exceptions/auth.exceptions";
import { UserEntity } from "../../../../src/domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../../src/domain/enums";
import { IUserRepository } from "../../../../src/domain/contracts/user.repository.interface";
import { IPasswordHasher } from "../../../../src/domain/contracts/password-hasher.interface";
import { ICacheService } from "../../../../src/domain/contracts/cache.service.interface";

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
    const userId = 123;
    const request = {
      userId,
      newPasswordRaw: "NewSecurePass123",
    };

    const existingUser = new UserEntity({
      id: userId,
      email: "staff@example.com",
      passwordHash: "old-hash",
      fullName: "Staff User",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: undefined,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
      useCase.execute({ userId: 999, newPasswordRaw: "pass" }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it("should throw CannotModifySuperAdminException if target is SUPER_ADMIN", async () => {
    const userId = 1;
    const existingUser = new UserEntity({
      id: userId,
      email: "super@example.com",
      passwordHash: "hash",
      fullName: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      customPermissions: undefined,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ userId, newPasswordRaw: "pass" }),
    ).rejects.toThrow(CannotModifySuperAdminException);
  });
});

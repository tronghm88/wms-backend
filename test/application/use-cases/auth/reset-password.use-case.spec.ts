/* eslint-disable @typescript-eslint/unbound-method */
import { ResetPasswordUseCase } from "../../../../src/application/use-cases/auth/reset-password.use-case";
import { UserEntity } from "../../../../src/domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../../src/domain/enums";
import {
  UserNotFoundException,
  UserInactiveException,
  InvalidOldPasswordException,
} from "../../../../src/domain/exceptions/auth.exceptions";
import type { IUserRepository } from "../../../../src/domain/contracts/user.repository.interface";
import type { IPasswordHasher } from "../../../../src/domain/contracts/password-hasher.interface";

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockPasswordHasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as unknown as jest.Mocked<IPasswordHasher>;

    useCase = new ResetPasswordUseCase(mockUserRepository, mockPasswordHasher);
  });

  const mockUser = new UserEntity({
    id: 1,
    email: "test@example.com",
    passwordHash: "hashed-old-password",
    fullName: "Test User",
    role: UserRole.WAREHOUSE_STAFF,
    customPermissions: undefined,
    status: UserStatus.ACTIVE,
    lastLoginAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("should successfully reset password", async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue("hashed-new-password");

    await useCase.execute({
      userId: 1,
      oldPasswordRaw: "old-password",
      newPasswordRaw: "new-password",
    });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
      "old-password",
      "hashed-old-password",
    );
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith("new-password");
    expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(
      1,
      "hashed-new-password",
    );
  });

  it("should throw UserNotFoundException if user does not exist", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 999,
        oldPasswordRaw: "old",
        newPasswordRaw: "new",
      }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it("should throw UserInactiveException if user is inactive", async () => {
    const inactiveUser = new UserEntity({
      id: 1,
      email: "test@example.com",
      passwordHash: "hashed-old-password",
      fullName: "Test User",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: undefined,
      status: UserStatus.INACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockUserRepository.findById.mockResolvedValue(inactiveUser);

    await expect(
      useCase.execute({
        userId: 1,
        oldPasswordRaw: "old",
        newPasswordRaw: "new",
      }),
    ).rejects.toThrow(UserInactiveException);
  });

  it("should throw InvalidOldPasswordException if old password does not match", async () => {
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId: 1,
        oldPasswordRaw: "wrong-old",
        newPasswordRaw: "new",
      }),
    ).rejects.toThrow(InvalidOldPasswordException);
  });
});

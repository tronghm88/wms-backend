/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateUserUseCase } from "./update-user.use-case";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserEntity } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/enums";
import { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { ICacheService } from "../../../domain/contracts/cache.service.interface";

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    mockCacheService = {
      del: jest.fn(),
    } as unknown as jest.Mocked<ICacheService>;
    useCase = new UpdateUserUseCase(mockUserRepository, mockCacheService);
  });

  it("should successfully update a user", async () => {
    const userId = 123;
    const request = {
      userId,
      fullName: "Updated Name",
      role: UserRole.ADMIN,
    };

    const existingUser = new UserEntity({
      id: userId,
      email: "test@example.com",
      passwordHash: "hash",
      fullName: "Old Name",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: undefined,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedUser = new UserEntity({
      id: userId,
      email: "test@example.com",
      passwordHash: "hash",
      fullName: request.fullName,
      role: request.role,
      customPermissions: undefined,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(existingUser);
    mockUserRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute(request);

    expect(result.fullName).toBe(request.fullName);
    expect(result.role).toBe(request.role);
    expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
      fullName: request.fullName,
      role: request.role,
      customPermissions: undefined,
      status: undefined,
    });
    expect(mockCacheService.del).toHaveBeenCalledWith(
      `session:user_data:${userId}`,
    );
    expect(mockCacheService.del).toHaveBeenCalledWith(
      `session:refresh_token:${userId}`,
    );
  });

  it("should throw UserNotFoundException if user does not exist", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 999 })).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it("should throw CannotModifySuperAdminException if user is SUPER_ADMIN", async () => {
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
      useCase.execute({ userId, fullName: "New Name" }),
    ).rejects.toThrow(CannotModifySuperAdminException);
  });

  it("should throw CannotCreateSuperAdminException if role is being changed to SUPER_ADMIN", async () => {
    const userId = 2;
    const existingUser = new UserEntity({
      id: userId,
      email: "staff@example.com",
      passwordHash: "hash",
      fullName: "Staff",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: undefined,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUserRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ userId, role: UserRole.SUPER_ADMIN }),
    ).rejects.toThrow(CannotCreateSuperAdminException);
  });
});

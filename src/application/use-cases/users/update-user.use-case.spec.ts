/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateUserUseCase } from "./update-user.use-case";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import {
  UserEntity,
  UserRole,
  UserStatus,
} from "../../../domain/entities/user.entity";
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
    const userId = "123";
    const request = {
      userId,
      fullName: "Updated Name",
      role: UserRole.ADMIN,
    };

    const existingUser = new UserEntity(
      userId,
      "test@example.com",
      "hash",
      "Old Name",
      UserRole.WAREHOUSE_STAFF,
      null,
      UserStatus.ACTIVE,
      null,
      new Date(),
      new Date(),
    );

    const updatedUser = new UserEntity(
      userId,
      "test@example.com",
      "hash",
      request.fullName,
      request.role,
      null,
      UserStatus.ACTIVE,
      null,
      new Date(),
      new Date(),
    );

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

    await expect(useCase.execute({ userId: "nonexistent" })).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it("should throw CannotModifySuperAdminException if user is SUPER_ADMIN", async () => {
    const userId = "admin-id";
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
      useCase.execute({ userId, fullName: "New Name" }),
    ).rejects.toThrow(CannotModifySuperAdminException);
  });

  it("should throw CannotCreateSuperAdminException if role is being changed to SUPER_ADMIN", async () => {
    const userId = "staff-id";
    const existingUser = new UserEntity(
      userId,
      "staff@example.com",
      "hash",
      "Staff",
      UserRole.WAREHOUSE_STAFF,
      null,
      UserStatus.ACTIVE,
      null,
      new Date(),
      new Date(),
    );

    mockUserRepository.findById.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ userId, role: UserRole.SUPER_ADMIN }),
    ).rejects.toThrow(CannotCreateSuperAdminException);
  });
});

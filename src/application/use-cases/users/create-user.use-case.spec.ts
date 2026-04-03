/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUseCase } from "./create-user.use-case";
import {
  EmailAlreadyExistsException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import {
  UserEntity,
  UserRole,
  UserStatus,
} from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
      updatePassword: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<IPasswordHasher>;
    useCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  it("should successfully create a new user", async () => {
    const request = {
      email: "newuser@example.com",
      passwordRaw: "password123",
      fullName: "New User",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: ["receipts:create"],
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue("hashed_password");
    mockUserRepository.create.mockResolvedValue(
      new UserEntity(
        "123",
        request.email,
        "hashed_password",
        request.fullName,
        request.role,
        request.customPermissions,
        UserStatus.ACTIVE,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(request);

    expect(result.id).toBe("123");
    expect(result.email).toBe(request.email);
    expect(result.customPermissions).toEqual(request.customPermissions);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: request.email,
      passwordHash: "hashed_password",
      fullName: request.fullName,
      role: request.role,
      customPermissions: request.customPermissions,
      status: UserStatus.ACTIVE,
      lastLoginAt: null,
    });
  });

  it("should throw CannotCreateSuperAdminException if role is SUPER_ADMIN", async () => {
    const request = {
      email: "superadmin@example.com",
      passwordRaw: "password123",
      fullName: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      CannotCreateSuperAdminException,
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("should throw EmailAlreadyExistsException if email is already taken", async () => {
    const request = {
      email: "existing@example.com",
      passwordRaw: "password123",
      fullName: "Existing User",
      role: UserRole.WAREHOUSE_STAFF,
    };

    mockUserRepository.findByEmail.mockResolvedValue(
      new UserEntity(
        "123",
        request.email,
        "hash",
        "Name",
        UserRole.WAREHOUSE_STAFF,
        null,
        UserStatus.ACTIVE,
        null,
        new Date(),
        new Date(),
      ),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      EmailAlreadyExistsException,
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});

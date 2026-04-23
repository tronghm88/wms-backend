/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUseCase } from "../../../../src/application/use-cases/users/create-user.use-case";
import {
  EmailAlreadyExistsException,
  UsernameAlreadyExistsException,
  CannotCreateSuperAdminException,
} from "../../../../src/domain/exceptions/auth.exceptions";
import { UserEntity } from "../../../../src/domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../../src/domain/enums";
import { IUserRepository } from "../../../../src/domain/contracts/user.repository.interface";
import { IPasswordHasher } from "../../../../src/domain/contracts/password-hasher.interface";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
      username: "newuser1",
      passwordRaw: "password123",
      fullName: "New User",
      role: UserRole.WAREHOUSE_STAFF,
      customPermissions: ["receipts:create"],
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue("hashed_password");
    mockUserRepository.create.mockResolvedValue(
      new UserEntity({
        id: 123,
        email: request.email,
        username: request.username,
        passwordHash: "hashed_password",
        fullName: request.fullName,
        role: request.role,
        customPermissions: request.customPermissions,
        status: UserStatus.ACTIVE,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(request);

    expect(result.id).toBe(123);
    expect(result.email).toBe(request.email);
    expect(result.username).toBe(request.username);
    expect(result.customPermissions).toEqual(request.customPermissions);
    expect(result.phone).toBeNull();
    expect(result.note).toBeNull();
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: request.email,
      username: request.username,
      passwordHash: "hashed_password",
      fullName: request.fullName,
      phone: undefined,
      note: undefined,
      role: request.role,
      customPermissions: request.customPermissions,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
    });
  });

  it("should throw CannotCreateSuperAdminException if role is SUPER_ADMIN", async () => {
    const request = {
      email: "superadmin@example.com",
      username: "superadmin",
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
      username: "newuser2",
      passwordRaw: "password123",
      fullName: "Existing User",
      role: UserRole.WAREHOUSE_STAFF,
    };

    mockUserRepository.findByEmail.mockResolvedValue(
      new UserEntity({
        id: 123,
        email: request.email,
        username: "existing",
        passwordHash: "hash",
        fullName: "Name",
        role: UserRole.WAREHOUSE_STAFF,
        customPermissions: undefined,
        status: UserStatus.ACTIVE,
        lastLoginAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      EmailAlreadyExistsException,
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("should throw UsernameAlreadyExistsException if username is already taken", async () => {
    const request = {
      email: "newuser@example.com",
      username: "takenuser",
      passwordRaw: "password123",
      fullName: "New User",
      role: UserRole.WAREHOUSE_STAFF,
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByUsername.mockResolvedValue(
      new UserEntity({
        id: 99,
        email: "other@example.com",
        username: request.username,
        passwordHash: "hash",
        fullName: "Other",
        role: UserRole.WAREHOUSE_STAFF,
        customPermissions: undefined,
        status: UserStatus.ACTIVE,
        lastLoginAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(useCase.execute(request)).rejects.toThrow(
      UsernameAlreadyExistsException,
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});

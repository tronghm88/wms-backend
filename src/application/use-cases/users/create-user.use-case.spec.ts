/* eslint-disable @typescript-eslint/unbound-method */
import { CreateUserUseCase } from "./create-user.use-case";
import {
  EmailAlreadyExistsException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserEntity } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/enums";
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
      new UserEntity({
        id: 123,
        email: request.email,
        passwordHash: "hashed_password",
        fullName: request.fullName,
        role: request.role,
        customPermissions: request.customPermissions,
        status: UserStatus.ACTIVE,
        lastLoginAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(request);

    expect(result.id).toBe(123);
    expect(result.email).toBe(request.email);
    expect(result.customPermissions).toEqual(request.customPermissions);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: request.email,
      passwordHash: "hashed_password",
      fullName: request.fullName,
      role: request.role,
      customPermissions: request.customPermissions,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
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
      new UserEntity({
        id: 123,
        email: request.email,
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
});

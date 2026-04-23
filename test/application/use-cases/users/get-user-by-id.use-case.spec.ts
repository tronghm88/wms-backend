import { Test, TestingModule } from "@nestjs/testing";
import { GetUserByIdUseCase } from "../../../../src/application/use-cases/users/get-user-by-id.use-case";
import {
  USER_REPOSITORY,
  IUserRepository,
} from "../../../../src/domain/contracts/user.repository.interface";
import { UserEntity } from "../../../../src/domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../../src/domain/enums";
import { NotFoundException } from "@nestjs/common";

describe("GetUserByIdUseCase", () => {
  let useCase: GetUserByIdUseCase;
  let mockUserRepository: jest.Mocked<Partial<IUserRepository>>;

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
  });

  it("should return user without password hash", async () => {
    const mockUser = new UserEntity({
      id: 1,
      email: "test@example.com",
      passwordHash: "hashed123",
      username: "testuser",
      fullName: "Test User",
      role: UserRole.WAREHOUSE_STAFF,
      status: UserStatus.ACTIVE,
      phone: null,
      note: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await useCase.execute(1);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(Reflect.has(result, "passwordHash")).toBe(false);
    expect(result.email).toBe("test@example.com");
    expect(result.status).toBe(UserStatus.ACTIVE);
    expect(result.phone).toBeNull();
    expect(result.note).toBeNull();
    expect(result.lastLoginAt).toBeNull();
  });

  it("should throw NotFoundException if user not found", async () => {
    (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});

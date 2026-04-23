import { Test, TestingModule } from "@nestjs/testing";
import { GetUsersUseCase } from "../../../../src/application/use-cases/users/get-users.use-case";
import {
  USER_REPOSITORY,
  IUserRepository,
} from "../../../../src/domain/contracts/user.repository.interface";
import { UserEntity } from "../../../../src/domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../../src/domain/enums";

describe("GetUsersUseCase", () => {
  let useCase: GetUsersUseCase;
  let mockUserRepository: jest.Mocked<Partial<IUserRepository>>;

  beforeEach(async () => {
    mockUserRepository = {
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
  });

  it("should return users and meta data correctly", async () => {
    const mockUser = new UserEntity({
      id: 1,
      email: "test@example.com",
      passwordHash: "hashed123",
      fullName: "Test User",
      role: UserRole.WAREHOUSE_STAFF,
      status: UserStatus.ACTIVE,
      phone: null,
      note: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.findAndCount as jest.Mock).mockResolvedValue([
      [mockUser],
      1,
    ]);

    const result = await useCase.execute({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 20,
    });

    expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      search: undefined,
      role: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(result.data).toHaveLength(1);
    expect(Reflect.has(result.data[0], "passwordHash")).toBe(false);
    expect(result.data[0].email).toBe("test@example.com");
    expect(result.data[0].phone).toBeNull();
    expect(result.data[0].note).toBeNull();
    expect(result.data[0].lastLoginAt).toBeNull();
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      lastPage: 1,
    });
  });
});

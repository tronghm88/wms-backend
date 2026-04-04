import { Test, TestingModule } from "@nestjs/testing";
import { GetUsersUseCase } from "./get-users.use-case";
import {
  USER_REPOSITORY,
  IUserRepository,
} from "../../../domain/contracts/user.repository.interface";
import { UserEntity } from "../../../domain/entities/user.entity";
import { UserRole, UserStatus } from "../../../domain/enums";

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
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      lastPage: 1,
    });
  });
});

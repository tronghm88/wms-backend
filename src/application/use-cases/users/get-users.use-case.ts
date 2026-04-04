import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { UserRole } from "../../../domain/enums";
import { UserEntity } from "../../../domain/entities/user.entity";

export interface GetUsersUseCaseInput {
  search?: string;
  role?: UserRole;
  sortBy: "createdAt" | "email" | "fullName";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface GetUsersUseCaseOutput {
  data: Omit<UserEntity, "passwordHash">[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetUsersUseCaseInput): Promise<GetUsersUseCaseOutput> {
    const { search, role, sortBy, sortOrder, page, limit } = input;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      search,
      role,
      sortBy,
      sortOrder,
    });

    const data = users.map((user) => {
      const clonedUser = new UserEntity(user);
      Reflect.deleteProperty(clonedUser, "passwordHash");
      return clonedUser as unknown as Omit<UserEntity, "passwordHash">;
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }
}

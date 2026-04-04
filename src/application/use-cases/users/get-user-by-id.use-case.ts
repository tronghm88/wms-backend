import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { UserEntity } from "../../../domain/entities/user.entity";

export type GetUserByIdUseCaseOutput = Omit<UserEntity, "passwordHash">;

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number): Promise<GetUserByIdUseCaseOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const clonedUser = new UserEntity(user);
    Reflect.deleteProperty(clonedUser, "passwordHash");
    return clonedUser as unknown as GetUserByIdUseCaseOutput;
  }
}

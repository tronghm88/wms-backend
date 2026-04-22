import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type {
  IUserRepository,
  UserStats,
} from "../../../domain/contracts/user.repository.interface";

@Injectable()
export class GetUsersStatsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<UserStats> {
    return this.userRepository.getStats();
  }
}

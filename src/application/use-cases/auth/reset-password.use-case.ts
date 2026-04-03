import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../../domain/contracts/password-hasher.interface";
import type { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import {
  InvalidOldPasswordException,
  UserInactiveException,
  UserNotFoundException,
} from "../../../domain/exceptions/auth.exceptions";

export interface ResetPasswordRequest {
  userId: number;
  oldPasswordRaw: string;
  newPasswordRaw: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: ResetPasswordRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.isActive()) {
      throw new UserInactiveException();
    }

    const isOldPasswordValid = await this.passwordHasher.compare(
      request.oldPasswordRaw,
      user.passwordHash,
    );

    if (!isOldPasswordValid) {
      throw new InvalidOldPasswordException();
    }

    const newPasswordHash = await this.passwordHasher.hash(
      request.newPasswordRaw,
    );

    await this.userRepository.updatePassword(user.id, newPasswordHash);
  }
}

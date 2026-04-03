import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../../domain/contracts/password-hasher.interface";
import type { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole } from "../../../domain/entities/user.entity";

export interface AdminResetPasswordRequest {
  userId: string;
  newPasswordRaw: string;
}

@Injectable()
export class AdminResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(request: AdminResetPasswordRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // AC: block ANY API requests attempting to manipulate (Update Role, Delete) the core SUPER_ADMIN account.
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new CannotModifySuperAdminException();
    }

    const newPasswordHash = await this.passwordHasher.hash(
      request.newPasswordRaw,
    );

    await this.userRepository.updatePassword(user.id, newPasswordHash);

    // Force re-login with the new password
    await this.cacheService.del(`session:user_data:${user.id}`);
    await this.cacheService.del(`session:refresh_token:${user.id}`);
  }
}

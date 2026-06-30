import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole, UserStatus } from "../../../domain/enums";

export interface UpdateUserStatusRequest {
  userId: number;
  status: UserStatus;
}

export interface UpdateUserStatusResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  note?: string | null;
  role: UserRole;
  customPermissions?: string[];
  status: UserStatus;
}

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(
    request: UpdateUserStatusRequest,
  ): Promise<UpdateUserStatusResponse> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // Block modification of the SUPER_ADMIN account
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new CannotModifySuperAdminException();
    }

    const updatedUser = await this.userRepository.update(request.userId, {
      status: request.status,
    });

    // Invalidate Redis session cache so change takes effect immediately
    await this.cacheService.del(`session:user_data:${user.id}`);
    // Revoke refresh token via reverse index (opaque token two-key pattern)
    const tokenHash = await this.cacheService.get<string>(
      `session:refresh_token_ref:${user.id}`,
    );
    if (tokenHash) {
      await this.cacheService.del(`session:refresh_token:${tokenHash}`);
    }
    await this.cacheService.del(`session:refresh_token_ref:${user.id}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      note: updatedUser.note,
      role: updatedUser.role,
      customPermissions: updatedUser.customPermissions,
      status: updatedUser.status,
    };
  }
}

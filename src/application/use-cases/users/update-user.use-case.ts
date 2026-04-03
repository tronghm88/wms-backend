import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole, UserStatus } from "../../../domain/entities/user.entity";

export interface UpdateUserRequest {
  userId: string;
  fullName?: string;
  role?: UserRole;
  customPermissions?: string[];
  status?: UserStatus;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  customPermissions: string[] | null;
  status: UserStatus;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // AC: block ANY API requests attempting to manipulate (Update Role, Delete) the core SUPER_ADMIN account.
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new CannotModifySuperAdminException();
    }

    // Restriction: Cannot change another user's role to SUPER_ADMIN
    if (request.role === UserRole.SUPER_ADMIN) {
      throw new CannotCreateSuperAdminException();
    }

    const updatedUser = await this.userRepository.update(request.userId, {
      fullName: request.fullName,
      role: request.role,
      customPermissions: request.customPermissions,
      status: request.status,
    });

    // Invalidate Redis cache to ensure immediate access revocation or update
    await this.cacheService.del(`session:user_data:${user.id}`);
    await this.cacheService.del(`session:refresh_token:${user.id}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      customPermissions: updatedUser.customPermissions,
      status: updatedUser.status,
    };
  }
}

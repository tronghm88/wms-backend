import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { CACHE_SERVICE } from "../../../domain/contracts/cache.service.interface";
import type { ICacheService } from "../../../domain/contracts/cache.service.interface";
import {
  UserNotFoundException,
  CannotModifySuperAdminException,
  CannotCreateSuperAdminException,
  UsernameAlreadyExistsException,
  InvalidPermissionException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole, UserStatus } from "../../../domain/enums";
import { Permissions } from "../../../domain/constants/permissions.constant";

export interface UpdateUserRequest {
  userId: number;
  username?: string;
  fullName?: string;
  phone?: string;
  note?: string;
  role?: UserRole;
  customPermissions?: string[];
}

export interface UpdateUserResponse {
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

    // Check username uniqueness if changing
    if (request.username && request.username !== user.username) {
      const existingByUsername = await this.userRepository.findByUsername(
        request.username,
      );
      if (existingByUsername) {
        throw new UsernameAlreadyExistsException();
      }
    }

    if (request.customPermissions) {
      const validPermissions = Object.values(Permissions) as string[];
      for (const p of request.customPermissions) {
        if (!validPermissions.includes(p)) {
          throw new InvalidPermissionException(p);
        }
      }
    }

    const updatedUser = await this.userRepository.update(request.userId, {
      username: request.username,
      fullName: request.fullName,
      phone: request.phone,
      note: request.note,
      role: request.role,
      customPermissions: request.customPermissions,
    });

    // Invalidate Redis cache to ensure immediate access revocation or update
    await this.cacheService.del(`session:user_data:${user.id}`);
    await this.cacheService.del(`session:refresh_token:${user.id}`);

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

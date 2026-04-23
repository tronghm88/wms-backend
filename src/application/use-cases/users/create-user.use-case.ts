import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../../domain/contracts/password-hasher.interface";
import type { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import {
  EmailAlreadyExistsException,
  UsernameAlreadyExistsException,
  CannotCreateSuperAdminException,
  InvalidPermissionException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole, UserStatus } from "../../../domain/enums";
import { Permissions } from "../../../domain/constants/permissions.constant";

export interface CreateUserRequest {
  email: string;
  username: string;
  passwordRaw: string;
  fullName: string;
  phone?: string;
  note?: string;
  role: UserRole;
  customPermissions?: string[];
}

export interface CreateUserResponse {
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
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    if (request.role === UserRole.SUPER_ADMIN) {
      throw new CannotCreateSuperAdminException();
    }

    const existingByEmail = await this.userRepository.findByEmail(
      request.email,
    );
    if (existingByEmail) {
      throw new EmailAlreadyExistsException();
    }

    const existingByUsername = await this.userRepository.findByUsername(
      request.username,
    );
    if (existingByUsername) {
      throw new UsernameAlreadyExistsException();
    }

    if (request.customPermissions) {
      const validPermissions = Object.values(Permissions) as string[];
      for (const p of request.customPermissions) {
        if (!validPermissions.includes(p)) {
          throw new InvalidPermissionException(p);
        }
      }
    }

    const passwordHash = await this.passwordHasher.hash(request.passwordRaw);

    const newUserInfo = {
      email: request.email,
      username: request.username,
      passwordHash,
      fullName: request.fullName,
      phone: request.phone,
      note: request.note,
      role: request.role,
      customPermissions: request.customPermissions,
      status: UserStatus.ACTIVE,
      lastLoginAt: undefined,
    };

    const createdUser = await this.userRepository.create(newUserInfo);

    return {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      fullName: createdUser.fullName,
      phone: createdUser.phone,
      note: createdUser.note,
      role: createdUser.role,
      customPermissions: createdUser.customPermissions,
      status: createdUser.status,
    };
  }
}

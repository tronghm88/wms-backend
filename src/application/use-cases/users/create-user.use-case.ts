import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../../domain/contracts/user.repository.interface";
import type { IUserRepository } from "../../../domain/contracts/user.repository.interface";
import { PASSWORD_HASHER } from "../../../domain/contracts/password-hasher.interface";
import type { IPasswordHasher } from "../../../domain/contracts/password-hasher.interface";
import {
  EmailAlreadyExistsException,
  CannotCreateSuperAdminException,
} from "../../../domain/exceptions/auth.exceptions";
import { UserRole, UserStatus } from "../../../domain/entities/user.entity";

export interface CreateUserRequest {
  email: string;
  passwordRaw: string;
  fullName: string;
  role: UserRole;
  customPermissions?: string[];
}

export interface CreateUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  customPermissions: string[] | null;
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

    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const passwordHash = await this.passwordHasher.hash(request.passwordRaw);

    const newUserInfo = {
      email: request.email,
      passwordHash,
      fullName: request.fullName,
      role: request.role,
      customPermissions: request.customPermissions ?? null,
      status: UserStatus.ACTIVE,
      lastLoginAt: null,
    };

    const createdUser = await this.userRepository.create(newUserInfo);

    return {
      id: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
      role: createdUser.role,
      customPermissions: createdUser.customPermissions,
      status: createdUser.status,
    };
  }
}

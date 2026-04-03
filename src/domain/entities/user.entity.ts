import { UserRole, UserStatus } from "../enums";

export class UserEntity {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  customPermissions: string[];
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

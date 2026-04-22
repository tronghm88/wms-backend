import { UserRole, UserStatus } from "../enums";

export class UserEntity {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  note?: string;
  role: UserRole;
  customPermissions?: string[];
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}

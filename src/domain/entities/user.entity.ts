import { UserRole, UserStatus } from "../enums";

export class UserEntity {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  note?: string | null;
  role: UserRole;
  customPermissions?: string[];
  status: UserStatus;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}

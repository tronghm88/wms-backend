import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const PERMISSIONS_KEY = "permissions";
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string; permissions?: string[] } }>();

    // user.permissions should be populated by JwtStrategy or somewhere else
    if (!user || !user.permissions) {
      return false;
    }

    // Role bypass
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    return requiredPermissions.every(
      (permission) =>
        user.permissions?.includes(permission) || user.role === "ADMIN", // For now, ADMIN can do everything
    );
  }
}

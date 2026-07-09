import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/require-permission.decorator';

interface UserJwtPayload {
  userId: string;
  role: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permission is required by the decorator, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserJwtPayload = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }

    const hasPermission = user.permissions.some((p) => {
      // Check if module matches (case-insensitive or exact)
      if (p.module.toLowerCase() !== requiredPermission.module.toLowerCase()) {
        return false;
      }
      // Check if actions list includes the required action
      return p.actions.includes(requiredPermission.action);
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permiso denegado. Se requiere la acción '${requiredPermission.action}' en el módulo '${requiredPermission.module}'`,
      );
    }

    return true;
  }
}

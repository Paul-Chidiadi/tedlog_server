import { ROLES_KEY } from '../constants';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLE } from '../enums/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRoles.length === 0) {
      throw new HttpException(
        'You are not authorized to access this route',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { currentUser } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some(
      (role) => currentUser.role === role && !currentUser.isSuspended,
    );
    if (hasRole) {
      return hasRole;
    }
    throw new HttpException(
      'You are not authorized to access this route',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

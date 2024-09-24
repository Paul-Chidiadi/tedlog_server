import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';
import { USER_ROLE } from '../enums/user.enum';

export const Roles = (...roles: USER_ROLE[]) => SetMetadata(ROLES_KEY, roles);

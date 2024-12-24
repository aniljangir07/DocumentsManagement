import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/common/constants.service';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

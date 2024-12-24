import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/constants.service';

@Injectable()
export class RolesGuard implements CanActivate {
      constructor(private reflector: Reflector) { }

      canActivate(context: ExecutionContext): boolean {

            console.log(' INTO THE GUARDS ')
            
            const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
            if (!requiredRoles) {
                  return true;
            }
            const { user } = context.switchToHttp().getRequest();

            console.log(' user role >>> ',user)
            
            return requiredRoles.some((role) =>{ 
                  return user?.roles?.includes(role)
            });
      }
}

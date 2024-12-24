import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../../common/entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'src/common/responsive.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UserService, ResponseService],
  controllers: [UserController],
})
export class UserModule {}

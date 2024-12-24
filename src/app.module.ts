import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user/user.module';
import { Users } from './common/entity/user.entity';

import { Document } from './common/entity/documents.entity';
import { DocumentModule } from './user/documents/document.module';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [Users, Document],
        synchronize: true,
      }),
    }),
    
    AuthModule,
    UserModule,
    DocumentModule
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
  ],
})
export class AppModule { }

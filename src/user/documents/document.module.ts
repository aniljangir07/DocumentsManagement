import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from '../../common/entity/documents.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ResponseService } from 'src/common/responsive.service';

@Module({
      imports: [TypeOrmModule.forFeature([Document])],
      providers: [DocumentService, ResponseService],
      controllers: [DocumentController],
})
export class DocumentModule { }

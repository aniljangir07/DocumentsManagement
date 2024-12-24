import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


import { Document } from 'src/common/entity/documents.entity';
import { ResponseService } from 'src/common/responsive.service';
import { CreateDocumentDto, EditDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {

      constructor(
            @InjectRepository(Document)
            private readonly documentRepository: Repository<Document>,
            private readonly responsiveService: ResponseService,
            private readonly httpService: HttpService
      ) { }

      createDocument = async (req, res, next, body: CreateDocumentDto): Promise<object> => {
            try {
                  const { title, pageSize, status = 'active' } = body;
                  const userId = req.user?.id;

                  console.log(' title pageSize status ', title, pageSize, status)

                  if (!userId) {
                        throw new Error('User is not authenticated');
                  }

                  const newDocument = this.documentRepository.create({
                        title,
                        pageSize,
                        status,
                        userId,
                  });

                  let uploaded = await this.documentRepository.save(newDocument);

                  this.responsiveService.sendSuccessResponse(res, uploaded, 'Document successfully created.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      editDocument = async (req, res, next, body: EditDocumentDto): Promise<object> => {
            try {
                  const documentId = req.params.id;
                  const { title, pageSize } = body;
                  const userId = req.user?.id;

                  const existingDocument = await this.documentRepository.findOne({ where: { id: documentId } });

                  if (!existingDocument) {
                        return this.responsiveService.sendBadRequest(res, 'Document not found or you do not have access.');
                  }

                  existingDocument.title = title ?? existingDocument.title;
                  existingDocument.pageSize = pageSize ?? existingDocument.pageSize;

                  const updatedDocument = await this.documentRepository.save(existingDocument);

                  return this.responsiveService.sendSuccessResponse(res, updatedDocument, 'Document updated successfully.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };


      viewDocument = async (id: number, req, res, next): Promise<object> => {
            try {
                  const document = await this.documentRepository.findOne({ where: { id } });

                  if (!document) {
                        throw new Error('Document not found');
                  }

                  this.responsiveService.sendSuccessResponse(res, document, 'Document fetched successfully.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      updateStatusDocument = async (id: number, status: string, req, res, next): Promise<object> => {
            try {
                  const document = await this.documentRepository.findOne({ where: { id } });

                  if (!document) {
                        throw new Error('Document not found');
                  }

                  document.status = status;

                  await this.documentRepository.save(document);

                  this.responsiveService.sendSuccessResponse(res, document, 'Document status updated successfully.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      deleteDocument = async (id: number, req, res, next): Promise<object> => {
            try {
                  const document = await this.documentRepository.findOne({ where: { id } });

                  if (!document) {
                        throw new Error('Document not found');
                  }

                  await this.documentRepository.delete(id);

                  this.responsiveService.sendSuccessResponse(res, null, 'Document deleted successfully.');
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      listDocument = async (req, res, next, page: number, limit: number): Promise<object> => {
            try {
                  const offset = (page - 1) * limit;

                  const [activeDocuments, total] = await this.documentRepository.findAndCount({
                        where: { status: 'active' },
                        skip: offset,
                        take: limit,
                        order: { id: 'ASC' },
                  });

                  const response = {
                        data: activeDocuments,
                        meta: {
                              total,
                              page,
                              limit,
                              totalPages: Math.ceil(total / limit),
                        },
                  };

                  this.responsiveService.sendSuccessResponse(
                        res,
                        response,
                        'Documents fetched successfully.'
                  );
            } catch (error) {
                  console.log('Error:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      };

      //This service will get the injected document list from a python service which is hosted on http://localhost:5000 and end point /get_documents 
      async getDocumentsFromPython(req, res, next, page: number, limit: number): Promise<object> {
            try {
                  const response = await firstValueFrom(
                        this.httpService.get('http://localhost:5000/get_documents', {
                              params: { page, limit },
                        })
                  );

                  this.responsiveService.sendSuccessResponse(
                        res,
                        response.data,
                        'Documents fetched successfully.'
                  );

            } catch (error) {
                  console.error('Error fetching documents from Python microservice:', error);
                  return this.responsiveService.sendBadRequest(res, error.message);
            }
      }
}

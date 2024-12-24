import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from 'src/common/entity/documents.entity';
import { ResponseService } from 'src/common/responsive.service';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { CreateDocumentDto, EditDocumentDto } from './dto/document.dto';
import { of } from 'rxjs';

describe('DocumentService', () => {
      let service: DocumentService;
      let documentRepository: Repository<Document>;
      let responsiveService: ResponseService;
      let httpService: HttpService;

      beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                  providers: [
                        DocumentService,
                        {
                              provide: getRepositoryToken(Document),
                              useValue: {
                                    create: jest.fn().mockReturnValue(new Document()),
                                    save: jest.fn(),
                                    findOne: jest.fn(),
                                    delete: jest.fn(),
                                    findAndCount: jest.fn(),
                              },
                        },
                        {
                              provide: ResponseService,
                              useValue: {
                                    sendSuccessResponse: jest.fn(),
                                    sendBadRequest: jest.fn(),
                              },
                        },
                        {
                              provide: HttpService,
                              useValue: {
                                    get: jest.fn().mockReturnValue(of({ data: [] })),
                              },
                        },
                  ],
            }).compile();

            service = module.get<DocumentService>(DocumentService);
            documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
            responsiveService = module.get<ResponseService>(ResponseService);
            httpService = module.get<HttpService>(HttpService);
      });

      describe('createDocument', () => {
            it('should create a document successfully', async () => {
                  const createDocumentDto: CreateDocumentDto = {
                        title: 'Test Document',
                        pageSize: 5,
                        status: 'active',
                  };

                  const user = { id: 1 };
                  const req = { user } as any;
                  const res = { json: jest.fn() } as any;

                  jest.spyOn(documentRepository, 'save').mockResolvedValue(createDocumentDto as any);

                  await service.createDocument(req, res, null, createDocumentDto);

                  expect(documentRepository.save).toHaveBeenCalledWith(expect.objectContaining(createDocumentDto));
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalledWith(
                        res,
                        createDocumentDto,
                        'Document successfully created.',
                  );
            });

            it('should throw an error if user is not authenticated', async () => {
                  const createDocumentDto: CreateDocumentDto = {
                        title: 'Test Document',
                        pageSize: 5,
                        status: 'active',
                  };

                  const req = { user: null } as any;
                  const res = { json: jest.fn() } as any;

                  await service.createDocument(req, res, null, createDocumentDto);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'User is not authenticated');
            });
      });

      describe('editDocument', () => {
            it('should update a document successfully', async () => {
                  const documentId = 1;
                  const updateDto: EditDocumentDto = { title: 'Updated Title', pageSize: 10, status: 'Published' };
                  const req = { params: { id: documentId }, user: { id: 1 } } as any;
                  const res = { json: jest.fn() } as any;

                  const document = { id: documentId, ...updateDto };
                  jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document as any);
                  jest.spyOn(documentRepository, 'save').mockResolvedValue(document as any);

                  await service.editDocument(req, res, null, updateDto);

                  expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
                  expect(documentRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalledWith(res, document, 'Document updated successfully.');
            });

            it('should throw an error if document is not found', async () => {
                  const documentId = 1;
                  const updateDto: EditDocumentDto = { title: 'Updated Title', pageSize: 10, status: 'Draft' };
                  const req = { params: { id: documentId }, user: { id: 1 } } as any;
                  const res = { json: jest.fn() } as any;

                  jest.spyOn(documentRepository, 'findOne').mockResolvedValue(null);

                  await service.editDocument(req, res, null, updateDto);

                  expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Document not found or you do not have access.');
            });
      });

      describe('viewDocument', () => {
            it('should fetch a document successfully', async () => {
                  const documentId = 1;
                  const req = {} as any;
                  const res = { json: jest.fn() } as any;
                  const next = jest.fn();
                  const document = { id: documentId, title: 'Sample Document', content: 'Some content' };

                  jest.spyOn(documentRepository, 'findOne').mockResolvedValue(document as any);

                  await service.viewDocument(documentId, req, res, next);

                  expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalledWith(
                        res,
                        document,
                        'Document fetched successfully.',
                  );
            });

            it('should return an error if document is not found', async () => {
                  const documentId = 1;
                  const req = {} as any;
                  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
                  const next = jest.fn();

                  jest.spyOn(documentRepository, 'findOne').mockResolvedValue(null);

                  await service.viewDocument(documentId, req, res, next);

                  expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Document not found');
            });

            it('should handle errors gracefully', async () => {
                  const documentId = 1;
                  const req = {} as any;
                  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;
                  const next = jest.fn();
                  const errorMessage = 'Database error';

                  jest.spyOn(documentRepository, 'findOne').mockRejectedValue(new Error(errorMessage));

                  await service.viewDocument(documentId, req, res, next);

                  expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: documentId } });
                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, errorMessage);
            });
      });
});

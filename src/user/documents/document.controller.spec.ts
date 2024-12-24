import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { ResponseService } from 'src/common/responsive.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guards';
import { Request, Response } from 'express';
import { CreateDocumentDto, EditDocumentDto } from './dto/document.dto';

describe('DocumentController', () => {
      let controller: DocumentController;
      let documentService: DocumentService;
      let responsiveService: ResponseService;

      beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                  controllers: [DocumentController],
                  providers: [
                        DocumentService,
                        ResponseService,
                        {
                              provide: JwtAuthGuard,
                              useValue: {
                                    canActivate: jest.fn().mockResolvedValue(true),
                              },
                        },
                        {
                              provide: RolesGuard,
                              useValue: {
                                    canActivate: jest.fn().mockResolvedValue(true),
                              },
                        },
                        {
                              provide: DocumentService,
                              useValue: {
                                    createDocument: jest.fn(),
                                    editDocument: jest.fn(),
                                    viewDocument: jest.fn(),
                                    updateStatusDocument: jest.fn(),
                                    deleteDocument: jest.fn(),
                                    listDocument: jest.fn(),
                                    getDocumentsFromPython: jest.fn(),
                              },
                        },
                        {
                              provide: ResponseService,
                              useValue: {
                                    sendSuccessResponse: jest.fn(),
                                    sendBadRequest: jest.fn(),
                              },
                        },
                  ],
            }).compile();

            controller = module.get<DocumentController>(DocumentController);
            documentService = module.get<DocumentService>(DocumentService);
            responsiveService = module.get<ResponseService>(ResponseService);
      });

      describe('createDocument', () => {
            it('should successfully create a document', async () => {
                  const createDocumentDto: CreateDocumentDto = {
                        title: 'Test Document',
                        pageSize: 5,
                        status: 'active',
                  };
                  const req = { user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.createDocument = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.createDocument(createDocumentDto, req, res, next);

                  expect(documentService.createDocument).toHaveBeenCalledWith(req, res, next, createDocumentDto);
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should return an error if the user is not authenticated', async () => {
                  const createDocumentDto: CreateDocumentDto = {
                        title: 'Test Document',
                        pageSize: 5,
                        status: 'active',
                  };
                  const req = { user: null } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  await controller.createDocument(createDocumentDto, req, res, next);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'User is not authenticated');
            });
      });

      describe('editDocument', () => {
            it('should successfully edit a document', async () => {
                  const editDocumentDto: EditDocumentDto = {
                        title: 'Updated Title', pageSize: 10,
                        status: ''
                  };
                  const req = { params: { id: '1' }, user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.editDocument = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.editDocument('1', editDocumentDto, req, res, next);

                  expect(documentService.editDocument).toHaveBeenCalledWith(req, res, next, editDocumentDto);
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should return an error if the document is not found', async () => {
                  const editDocumentDto: EditDocumentDto = {
                        title: 'Updated Title', pageSize: 10,
                        status: ''
                  };
                  const req = { params: { id: '1' }, user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.editDocument = jest.fn().mockRejectedValue(new Error('Document not found'));

                  await controller.editDocument('1', editDocumentDto, req, res, next);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Document not found');
            });
      });

      describe('viewDocument', () => {
            it('should successfully view a document', async () => {
                  const req = { user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.viewDocument = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.viewDocument(1, req, res, next);

                  expect(documentService.viewDocument).toHaveBeenCalledWith(1, req, res, next, expect.any(Object));
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should return an error if the document is not found', async () => {
                  const req = { user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();  // Mock next function

                  documentService.viewDocument = jest.fn().mockRejectedValue(new Error('Document not found'));

                  await controller.viewDocument(1, req, res, next);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Document not found');
            });
      });

      describe('deleteDocument', () => {
            it('should successfully delete a document', async () => {
                  const req = { user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.deleteDocument = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.deleteDocument(1, req, res, next);

                  expect(documentService.deleteDocument).toHaveBeenCalledWith(1, req, res, next);
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should return an error if the document is not found', async () => {
                  const req = { user: { id: 1 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.deleteDocument = jest.fn().mockRejectedValue(new Error('Document not found'));

                  await controller.deleteDocument(1, req, res, next);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Document not found');
            });
      });

      describe('listDocument', () => {
            it('should successfully list documents', async () => {
                  const req = { query: { page: 1, limit: 10 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.listDocument = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.listDocument(req, res, next);

                  expect(documentService.listDocument).toHaveBeenCalledWith(req, res, next, 1, 10);
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should return an error if invalid pagination parameters are provided', async () => {
                  const req = { query: { page: -1, limit: -10 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  await controller.listDocument(req, res, next);

                  expect(responsiveService.sendBadRequest).toHaveBeenCalledWith(res, 'Invalid pagination parameters. Page and limit must be positive numbers.');
            });
      });

      describe('getDocuments', () => {
            it('should successfully fetch documents from Python service', async () => {
                  const req = { query: { page: 1, limit: 10 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.getDocumentsFromPython = jest.fn().mockResolvedValue(true);
                  responsiveService.sendSuccessResponse = jest.fn();

                  await controller.getDocuments(1, 10, req, res, next);

                  expect(documentService.getDocumentsFromPython).toHaveBeenCalledWith(req, res, next, 1, 10);
                  expect(responsiveService.sendSuccessResponse).toHaveBeenCalled();
            });

            it('should handle errors when fetching documents from Python service', async () => {
                  const req = { query: { page: 1, limit: 10 } } as unknown as Request;
                  const res = { json: jest.fn() } as unknown as Response;
                  const next = jest.fn();

                  documentService.getDocumentsFromPython = jest.fn().mockRejectedValue(new Error('Error fetching documents'));

                  await controller.getDocuments(1, 10, req, res, next);

                  expect(res.status).toHaveBeenCalledWith(500);
                  expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching documents', error: 'Error fetching documents' });
            });
      });
});

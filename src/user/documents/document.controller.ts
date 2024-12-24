import { Controller, Post, Get, Param, Body, UseGuards, Req, Res, Next, Delete, Query } from '@nestjs/common';
import { CreateDocumentDto, EditDocumentDto } from './dto/document.dto';
import { DocumentService } from './document.service';
import { Role } from 'src/common/constants.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guards';
import { ResponseService } from 'src/common/responsive.service';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('documents')
export class DocumentController {
      constructor(
            private readonly documentService: DocumentService,
            private readonly responsiveService: ResponseService
      ) { }

      @Post('/create')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin)
      async createDocument(
            @Body() body: CreateDocumentDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  await this.documentService.createDocument(req, res, next, body);
            } catch (error) {
                  console.log('Error', error);
                  this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      @Post('/edit/:id')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Editor)
      async editDocument(
            @Param('id') id: string,
            @Body() body: EditDocumentDto,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  this.documentService.editDocument(req, res, next, body)
            } catch (error) {
                  console.log('Error ', error)
                  this.responsiveService.sendBadRequest(res, error.message)
            }
      }

      @Get('/view/:id')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Editor, Role.Viewer)
      async viewDocument(
            @Param('id') id: number,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  await this.documentService.viewDocument(id, req, res, next);
            } catch (error) {
                  console.log('Error ', error);
                  this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      @Get('/:id/:status')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin)
      async updateStatusDocument(
            @Param('id') id: number,
            @Param('status') status: string,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  await this.documentService.updateStatusDocument(id, status, req, res, next);
            } catch (error) {
                  console.log('Error ', error);
                  this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      @Delete('/:id')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin)
      async deleteDocument(
            @Param('id') id: number,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  await this.documentService.deleteDocument(id, req, res, next);
            } catch (error) {
                  console.log('Error ', error);
                  this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      @Get('/list')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Viewer, Role.Editor)
      async listDocument(
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ): Promise<any> {
            try {
                  const { page = 1, limit = 10 } = req.query;

                  const pageNumber = Number(page);
                  const limitNumber = Number(limit);

                  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
                        throw new Error('Invalid pagination parameters. Page and limit must be positive numbers.');
                  }

                  await this.documentService.listDocument(req, res, next, pageNumber, limitNumber);
            } catch (error) {
                  console.log('Error:', error);
                  this.responsiveService.sendBadRequest(res, error.message);
            }
      }

      @Get('/python/list')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @Roles(Role.Admin, Role.Viewer, Role.Editor)
      async getDocuments(
            @Query('page') page: number,
            @Query('limit') limit: number,
            @Req() req: Request,
            @Res() res: Response,
            @Next() next: NextFunction
      ) {
            try {
                  await this.documentService.getDocumentsFromPython(req, res, next, page, limit);
            } catch (error) {
                  return res.status(500).json({ message: 'Error fetching documents', error: error.message });
            }
      }
}

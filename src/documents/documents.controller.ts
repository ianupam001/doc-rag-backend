import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { Roles } from 'src/common/decorators';
import { DocumentStatus, UserRole } from '@prisma/client';
import {
  CreateDocumentDto,
  DocumentQueryDto,
  DocumentResponseDto,
  UpdateDocumentDto,
} from './dtos';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { PaginatedResponseDto } from 'src/common/dtos';
import path from 'path';

@ApiBearerAuth()
@ApiTags('Documents')
@Controller({
  path: 'documents',
  version: '1',
})
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document data with file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Project Report' },
        description: {
          type: 'string',
          example: 'Quarterly project progress report',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @GetCurrentUserId() userId: number,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.create(userId, file, createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of documents retrieved successfully',
    type: PaginatedResponseDto<DocumentResponseDto>,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: DocumentQueryDto, @Request() req: any) {
    return this.documentsService.findAll(req.user.userId, req.user.role, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(+id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.update(
      +id,
      req.user.userId,
      req.user.role,
      updateDocumentDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(+id, req.user.userId, req.user.role);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  @ApiParam({ name: 'id', description: 'Document ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async download(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const { absolutePath, fileName, fileType } =
      await this.documentsService.getDocumentFile(
        +id,
        req.user.userId,
        req.user.role,
      );

    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send file with proper root handling
    res.sendFile(fileName, {
      root: path.dirname(absolutePath),
    });
  }
}

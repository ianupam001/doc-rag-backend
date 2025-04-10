import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { DocumentQueryDto } from './dtos/document-query.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { IngestionService } from 'src/ingestion/ingestion.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private ingestionService: IngestionService,
  ) {}

  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';

  async create(
    userId: number,
    file: Express.Multer.File,
    dto: CreateDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadPath, fileName);

      await fs.promises.writeFile(filePath, file.buffer);

      const document = await this.prisma.document.create({
        data: {
          title: dto.title,
          description: dto.description,
          filePath: fileName,
          fileType: file.mimetype,
          fileSize: file.size,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      const ingestion = await this.ingestionService.triggerIngestion(
        document.id,
      );
      const responseObject = {
        ...document,
        ingestion: ingestion,
      };
      return responseObject;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findAll(userId: number, role: string, query: DocumentQueryDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      ...(role !== 'ADMIN' ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    try {
      const [documents, total] = await Promise.all([
        this.prisma.document.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        this.prisma.document.count({ where }),
      ]);

      return {
        data: documents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch documents');
    }
  }

  async findOne(id: number, userId: number, role: string) {
    const where = {
      id,
      ...(role !== 'ADMIN' ? { userId } : {}),
    };

    const document = await this.prisma.document.findFirst({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        ingestion: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(
    id: number,
    userId: number,
    role: string,
    dto: UpdateDocumentDto,
  ) {
    await this.findOne(id, userId, role);

    try {
      return await this.prisma.document.update({
        where: { id },
        data: dto,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  async remove(id: number, userId: number, role: string) {
    const document = await this.findOne(id, userId, role);

    try {
      await this.prisma.document.delete({ where: { id } });

      const filePath = path.join(this.uploadPath, document.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return document;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async getDocumentFile(id: number, userId: number, role: string) {
    const where = {
      id,
      ...(role !== 'ADMIN' ? { userId } : {}),
    };

    const document = await this.prisma.document.findFirst({ where });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.join(this.uploadPath, document.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return {
      absolutePath: path.resolve(filePath), // Ensure absolute path
      fileName: document.filePath,
      fileType: document.fileType,
    };
  }
}

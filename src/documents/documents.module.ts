import {  forwardRef, Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IngestionModule } from 'src/ingestion/ingestion.module';


@Module({
  imports: [PrismaModule, forwardRef(() => IngestionModule)],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}

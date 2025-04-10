import {
  Controller,
  Post,
  Get,
  Param,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { Roles } from 'src/common/decorators';
import { UserRole } from '@prisma/client';
import { IngestionResponseDto, IngestionWebhookDto } from './dtos';

@ApiBearerAuth()
@ApiTags('Ingestion')
@Controller({
  path: 'ingestion',
  version: '1',
})
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post(':documentId/trigger')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger document ingestion process' })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: Number })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Ingestion process started',
    type: IngestionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  async triggerIngestion(@Param('documentId') documentId: string) {
    return this.ingestionService.triggerIngestion(+documentId);
  }

  @Get(':documentId/status')
  @ApiOperation({ summary: 'Check ingestion status' })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current ingestion status',
    type: IngestionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document or ingestion record not found',
  })
  async getStatus(@Param('documentId') documentId: string) {
    return this.ingestionService.checkIngestionStatus(+documentId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook for ingestion status updates' })
  @ApiHeader({
    name: 'x-webhook-secret',
    description: 'Webhook authentication secret',
  })
  @ApiBody({ type: IngestionWebhookDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid webhook secret',
  })
  async handleWebhook(
    @Body() body: IngestionWebhookDto,
    @Headers('x-webhook-secret') secret: string,
  ) {
    if (secret !== process.env.WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return this.ingestionService.handleWebhook(body);
  }
}

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGaurd, RolesGuard } from './common/guards';
import { ConfigModule } from '@nestjs/config';
import { AppRequestLoggerMiddleware } from './common/middlewares/app-request-logger.middleware';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGaurd,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AppRequestLoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

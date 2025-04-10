import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const isProd = process.env.ENV === 'PROD';
  const port = isProd ? process.env.PROD_PORT : process.env.DEV_PORT;
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  if (swaggerUser === undefined || swaggerPassword === undefined) {
    throw new Error(
      'SWAGGER_USER and SWAGGER_PASSWORD must be set in .env file',
    );
  }

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(
    ['/docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: {
        [swaggerUser]: swaggerPassword,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Document Management & RAG Q&A API')
    .setDescription(
      'This API provides services for managing users, documents, and ingestion pipelines. It also integrates with a Python backend for Retrieval-Augmented Generation (RAG)-based Q&A.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port || 5000, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger docs are available at http://localhost:${port}/docs`);
  });
}
bootstrap();

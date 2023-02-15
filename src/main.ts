import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MAIN');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors();
  app.use(morgan('combined'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true
    }),
  );

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Stepup Vest API')
    .setDescription('Stepup Vest API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'StepUpVest API Docs',
  };

  SwaggerModule.setup('api/v1/docs', app, document, customOptions);

  await app.listen(process.env.PORT || 5000);

  logger.log(`server running on ${await app.getUrl()} : ` + new Date());
}

bootstrap();

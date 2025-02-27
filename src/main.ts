import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RootRedirectInterceptor } from './common/interceptors/root-redirect.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new RootRedirectInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('UNMSM LMS API')
    .setDescription('API for UNMSM LMS')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.APP_PORT ?? 4000);
}
bootstrap();

/**
 * 앱 진입점. CORS, `/api` prefix, 전역 ValidationPipe·예외 필터·응답 인터셉터,
 * Swagger 문서(`/docs`)를 설정한 뒤 listen 한다.
 */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string[]>('cors.origin'),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const message = first?.constraints ? Object.values(first.constraints)[0] : '입력값이 올바르지 않습니다.';
        return new BadRequestException(message);
      },
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Academy Program API')
      .setDescription('학원 프로그램 NestJS API 문서')
      .setVersion('0.1')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.getOrThrow<number>('port'));
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { QueryFailedFilter } from './shared/filters/query-failed.filter';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { DataSource } from 'typeorm';
import { runGlobalMigration } from './shared/database/global-migration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Executa a migration global antes de iniciar o servidor
  // const dataSource = app.get(DataSource);
  // await runGlobalMigration(dataSource);

  // ✅ Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não decoradas
      forbidNonWhitelisted: false, // Permite campos extras (como confirmPassword)
      transform: true, // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new QueryFailedFilter()); // Specific filter first
  app.useGlobalFilters(new AllExceptionsFilter()); // Generic filter second

  // Enable CORS for frontend dev server
  app.enableCors({ origin: 'http://localhost:9000' });
  app.setGlobalPrefix('api');

  // Configuração do Swagger com suporte a JWT (nome padrão 'bearer')
  const config = new DocumentBuilder()
    .setTitle('AuthGuard API')
    .setDescription('Documentação da API AuthGuard')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function initializeDatabase() {
  console.log('🔄 Inicializando banco de dados...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'authguard',
    entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Banco de dados inicializado com sucesso!');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🏗️  Sincronizando esquemas...');
      await dataSource.synchronize();
      console.log('✅ Esquemas sincronizados!');
    }
    
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    throw error;
  }
}

async function bootstrap() {
  // Inicializar banco de dados antes de criar a aplicação
  await initializeDatabase();
  
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AuthGuard API')
    .setDescription('Multitenancy Authentication and Authorization System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Tenants', 'Tenant management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Subscriptions', 'Subscription management endpoints')
    .addTag('Licenses', 'License management endpoints')
    .addTag('Applications', 'Application management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap(); 
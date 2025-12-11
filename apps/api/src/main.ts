import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS - allow all origins for development (mobile access)
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: false, // Set to false since we're using JWT tokens, not cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Session-Id'],
    exposedHeaders: [],
    maxAge: 86400, // 24 hours
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: false, // Don't throw error, just strip unknown properties (like id, createdAt, updatedAt)
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
    }),
  );


  const port = process.env.PORT || 3000;
  const host = '0.0.0.0'; // Listen on all interfaces
  
  await app.listen(port, host, () => {
    console.log(`🚀 Backend API running on ${host}:${port}`);
  });
}
bootstrap();

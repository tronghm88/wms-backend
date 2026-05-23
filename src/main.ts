import { NestFactory } from "@nestjs/core";
import { LoggerService } from "./infrastructure/logging/logger.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./presentation/filters/global-exception.filter";
import { ResponseInterceptor } from "./presentation/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  // Enable CORS
  app.enableCors();

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Response Interceptor (wraps all success responses in ApiResponse envelope)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter (wraps all error responses in ApiResponse envelope)
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("WMS Backend API")
    .setDescription("The Warehouse Management System Backend API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

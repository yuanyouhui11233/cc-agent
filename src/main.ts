import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/transform.interceptor";
import { AllExceptionsFilter } from "./common/http-exception.filter";
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix("api");
  app.enableCors();

  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");
  const port = configService.get<number>("APP_PORT", 3000);

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
}

bootstrap();

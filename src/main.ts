import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix("api");
  app.enableCors();

  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");
  const port = configService.get<number>("APP_PORT", 3000);

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
}

bootstrap();

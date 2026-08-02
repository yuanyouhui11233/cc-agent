import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AgentsController } from "./agents/agents.controller";
import { AgentsService } from "./agents/agents.service";
import { ToolsModule } from "./tools/tools.module";
import { MemoryModule } from "./memory/memory.module";
import { ChainsModule } from "./chains/chains.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TasksModule } from "./tasks/tasks.module";
import { AiModule } from "./ai/ai.module";
import { aiConfig } from "./config/ai.config";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [aiConfig],
    }),
    ToolsModule,
    MemoryModule,
    ChainsModule,
    PrismaModule,
    TasksModule,
    AiModule,
    AuthModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "src", "static"), // 指向 src/static
      serveRoot: "/static", //访问前缀：http://localhost:3000/static/
    }),
  ],
  controllers: [AppController, AgentsController],
  providers: [AgentsService],
})
export class AppModule {}

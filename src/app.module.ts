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
  ],
  controllers: [AppController, AgentsController],
  providers: [AgentsService],
})
export class AppModule {}

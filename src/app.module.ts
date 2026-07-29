import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AgentsController } from './agents/agents.controller';
import { AgentsService } from './agents/agents.service';
import { ToolsModule } from './tools/tools.module';
import { MemoryModule } from './memory/memory.module';
import { ChainsModule } from './chains/chains.module';

@Module({
  imports: [ToolsModule, MemoryModule, ChainsModule],
  controllers: [AppController, AgentsController],
  providers: [AgentsService],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TasksService } from "./tasks.service";

// TasksModule：收口任务相关的数据库能力与服务逻辑。
// 未来如果再扩展任务队列、任务重试、任务回放等能力，可以继续在这里追加。
@Module({
  imports: [PrismaModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

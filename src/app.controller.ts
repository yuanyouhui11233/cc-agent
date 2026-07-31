import { Body, Controller, Get, Post } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  // 基础健康检查：确认服务本身已经起来
  @Get()
  health() {
    return { status: "ok" };
  }

  // 数据库健康检查：确认 Prisma 可以访问 PostgreSQL
  @Get("db-health")
  async dbHealth() {
    try {
      await this.prisma.ping();
      return { status: "ok", database: "postgresql" };
    } catch (error) {
      return {
        status: "error",
        database: "postgresql",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // 获取最近创建的任务，供后续 Agent 执行链路展示状态使用
  @Get("tasks")
  async listTasks() {
    return this.prisma.client.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // 创建一条任务记录，后续 Planner / Agent 可以基于这条记录继续补充状态
  @Post("tasks")
  async createTask(
    @Body()
    body: {
      userInput: string;
      taskType?: string;
      agentName?: string;
    },
  ) {
    return this.prisma.client.task.create({
      data: {
        userInput: body.userInput,
        taskType: body.taskType ?? "general",
        agentName: body.agentName,
        status: "PENDING",
      },
    });
  }
}

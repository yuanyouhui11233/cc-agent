import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
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

  // 获取最近创建的任务，供后续 Planner / Agent / Report 链路展示状态使用。
  // 这里默认返回最近 20 条，方便在开发阶段快速查看任务流转情况。
  @Get("tasks")
  async listTasks() {
    return this.prisma.client.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // 创建一条任务记录，后续 Planner / Agent 可以基于这条记录继续补充状态。
  // 任务创建后默认状态为 PENDING，表示等待后续执行链路消费。
  @Post("tasks")
  async createTask(
    @Body()
    body: {
      userInput: string;
      taskType?: string;
      agentName?: string;
      metadata?: Prisma.InputJsonValue;
      errorMessage?: string;
    },
  ) {
    return this.prisma.client.task.create({
      data: {
        userInput: body.userInput,
        taskType: body.taskType ?? "general",
        agentName: body.agentName,
        metadata: body.metadata,
        errorMessage: body.errorMessage,
        status: "PENDING",
      },
    });
  }

  // 获取某个任务对应的执行日志，便于调试 Agent 每一步的具体状态。
  @Get("tasks/:taskId/logs")
  async listTaskLogs(@Param("taskId", ParseIntPipe) taskId: number) {
    return this.prisma.client.taskLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });
  }

  // 为某个任务追加一条日志。
  // 这条接口是后续 Planner / Agent / Tool 调用链路的观测点，方便串起执行过程。
  @Post("tasks/:taskId/logs")
  async createTaskLog(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body()
    body: {
      level?: string;
      stepName?: string;
      message: string;
    },
  ) {
    return this.prisma.client.taskLog.create({
      data: {
        taskId,
        level: body.level ?? "INFO",
        stepName: body.stepName,
        message: body.message,
      },
    });
  }
}

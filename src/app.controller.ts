import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { TasksService } from "./tasks/tasks.service";

@Controller()
export class AppController {
  constructor(private readonly tasksService: TasksService) {}

  // 基础健康检查：确认服务本身已经起来
  @Get()
  health() {
    return { status: "ok" };
  }

  // 数据库健康检查：确认 Prisma 可以访问 PostgreSQL
  // 这里继续保留直接访问 PrismaClient 的方式，用来验证底层连接状态。
  @Get("db-health")
  async dbHealth() {
    const prisma = new PrismaClient();

    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "postgresql" };
    } catch (error) {
      return {
        status: "error",
        database: "postgresql",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  // 获取最近创建的任务，供后续 Planner / Agent / Report 链路展示状态使用。
  // 这里默认返回最近 20 条，方便在开发阶段快速查看任务流转情况。
  @Get("tasks")
  async listTasks() {
    return this.tasksService.listTasks();
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
    return this.tasksService.createTask(body);
  }

  // 更新任务状态：用于把一条任务从 PENDING 推进到 RUNNING / SUCCEEDED / FAILED。
  // 这条接口是整个任务生命周期管理的核心入口，后续 Planner / Agent 都会依赖它更新状态。
  @Patch("tasks/:taskId/status")
  async updateTaskStatus(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body()
    body: {
      status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
      errorMessage?: string;
      result?: Prisma.InputJsonValue;
    },
  ) {
    return this.tasksService.updateTaskStatus(taskId, body);
  }

  // 获取某个任务对应的执行日志，便于调试 Agent 每一步的具体状态。
  @Get("tasks/:taskId/logs")
  async listTaskLogs(@Param("taskId", ParseIntPipe) taskId: number) {
    return this.tasksService.listTaskLogs(taskId);
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
    return this.tasksService.createTaskLog(taskId, body);
  }
}

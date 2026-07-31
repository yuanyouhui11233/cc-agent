import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

// TasksService：统一封装任务主表与日志表的读写逻辑。
// 这样 Controller 只负责接收 HTTP 请求，不直接拼接 Prisma 查询，职责更清晰。
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // 获取最近一批任务：一般用于开发调试或管理端看板。
  async listTasks() {
    return this.prisma.client.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // 创建一条任务记录。
  // 默认状态为 PENDING，表示这条任务已进入等待执行状态。
  async createTask(body: {
    userInput: string;
    taskType?: string;
    agentName?: string;
    metadata?: Prisma.InputJsonValue;
    errorMessage?: string;
  }) {
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

  // 更新任务状态：这是任务生命周期管理的核心入口。
  // Planner / Agent 在执行前、执行中、执行成功或失败时，都会走这里。
  async updateTaskStatus(
    taskId: number,
    body: {
      status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
      errorMessage?: string;
      result?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.client.task.update({
      where: { id: taskId },
      data: {
        status: body.status,
        errorMessage: body.errorMessage,
        result: body.result,
      },
    });
  }

  // 查询某个任务的执行日志，方便排查 Agent 的一步一步执行过程。
  async listTaskLogs(taskId: number) {
    return this.prisma.client.taskLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });
  }

  // 为某个任务追加一条日志。
  // 该方法可以用于记录 Planner / Agent / Tool 的状态转移信息。
  async createTaskLog(
    taskId: number,
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

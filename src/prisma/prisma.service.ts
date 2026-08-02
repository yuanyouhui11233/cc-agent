import "dotenv/config";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 全局数据库访问入口。
// 负责：
// 1. 读取环境变量中的 DATABASE_URL
// 2. 创建 PrismaClient
// 3. 为其他业务模块提供统一的数据访问能力
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // PrismaClient 实例，后续所有业务模块都可以通过此服务访问 PostgreSQL

  constructor() {
    // 通过 super() 把配置传给 PrismaClient 父类
    super({
      adapter: new PrismaPg({
        // Postgres 连接串来自 .env
        connectionString: process.env.DATABASE_URL ?? "",
      }),
    });
  }

  // 简单健康检查接口：用真实 SQL 验证数据库连接是否正常
  async ping() {
    return this.$queryRaw`SELECT 1`;
  }
  // 应用启动时自动连接数据库
  async onModuleInit() {
    await this.$connect();
    this.logger.log("Prisma connect PostgreSQL.");
  }
  // NestJS 应用关闭时，释放数据库连接
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Prisma disconnected from PostgreSQL.");
  }
}

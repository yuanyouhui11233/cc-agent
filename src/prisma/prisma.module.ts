import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// PrismaModule 的作用是把数据库访问能力注册为全局可注入服务。
// 这样其他模块（例如 Agent、Task、Memory 等）不需要重复创建 PrismaClient，
// 只需要注入 PrismaService 即可统一访问 PostgreSQL。
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

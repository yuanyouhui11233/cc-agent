import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RedisModule } from "@nestjs-modules/ioredis";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonAuthModule } from "../common/auth/auth.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    PrismaModule,
    // 注册redis模块
    RedisModule.forRoot({
      type: "single",
      url: process.env.REDIS_URL,
    }),
    CommonAuthModule,
  ],
})
export class AuthModule {}

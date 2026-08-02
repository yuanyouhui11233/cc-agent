import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Resend } from "resend";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import { JwtService } from "@nestjs/jwt";

const resend = new Resend(process.env.RESEND_API_KEY);

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 生成六位随机验证码
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendCode(email: string) {
    // 防刷：60秒发送一次
    const exists = await this.redis.get(`verify:email:${email}`);
    if (exists) {
      throw new BadRequestException("验证码已发送，请60秒后重试");
    }
    // 验证码
    const code = this.generateCode();
    console.log("code", code);
    // 存入redis 5分钟过期（300）
    await this.redis.setex(`verify:email:${email}`, 300, code);
    // 发送
    const { data, error } = await resend.emails.send({
      from: "系统通知 <onboarding@resend.dev>",
      to: "delivered@resend.dev",
      subject: "登录验证码",
      html: `<p>您的验证码是：<strong>${code}</strong></p><p>5分钟内有效，请勿泄露给他人。</p>`,
    });

    return { send: true };
  }

  // 登录时校验验证码
  async verifyCode(email: string, code: string) {
    const cached = await this.redis.get(`verify:email:${email}`);
    if (!cached) {
      throw new BadRequestException("验证码已过期，请重新获取");
    }
    if (cached !== code) {
      throw new BadRequestException("验证码错误");
    }
    // 校验成功 删除缓存
    await this.redis.del(`verify:email:${email}`);
    return true;
  }

  // 登录
  async login(email: string, code: string) {
    // 1.验证验证码
    await this.verifyCode(email, code);
    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: {
        email,
        status: "ACTIVE",
      },
    });
    console.log("user", user);
    const isNewUser = !user;
    if (isNewUser) {
      const defaultUsername = email.split("@")[0];
      user = await this.prisma.user.create({
        data: {
          email,
          username: defaultUsername,
          avatarUrl: `${process.env.APP_URL}/static/default_avatar.png`,
        },
      });
    }
    // 3.更新登录时间
    await this.prisma.user.update({
      where: { id: user?.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
    // 4.生成jwt
    const payload = { sub: user?.id, email: user?.email };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        ...user,
        isNewUser,
      },
    };
  }
}

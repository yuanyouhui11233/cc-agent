import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";
import { JwtService } from "@nestjs/jwt";
import { Resend } from "resend";
import { createHash, randomUUID } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 生成验证码
   */
  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * token hash
   */
  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * 发送验证码
   */
  async sendCode(email: string) {
    const exists = await this.redis.get(`verify:${email}`);
    if (exists) {
      throw new BadRequestException("验证码已发送，请稍后重试");
    }

    const code = this.generateCode();
    // 验证码存redis 300秒
    await this.redis.setex(`verify:${email}`, 300, code);
    await resend.emails.send({
      from: "系统通知 <onboarding@resend.dev>",
      to: email,
      subject: "登录验证码",
      html: `
      <p>
      验证码:
      <strong>${code}</strong>
      </p>
      `,
    });

    return {
      success: true,
    };
  }

  /**
   * 校验验证码
   */
  async verifyCode(email: string, code: string) {
    const cache = await this.redis.get(`verify:${email}`);
    if (!cache) {
      throw new BadRequestException("验证码已过期");
    }
    if (cache !== code) {
      throw new BadRequestException("验证码错误");
    }

    await this.redis.del(`verify:${email}`);

    return true;
  }

  /**
   * 登录
   */
  async login(email: string, code: string, deviceId: string) {
    // 1.验证code
    await this.verifyCode(email, code);
    // 2.查user
    let user = await this.prisma.user.findUnique({
      where: {
        email,
        status: "ACTIVE",
      },
    });

    const isNewUser = !user;
    // 3.没有该user 进行注册
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: email.split("@")[0],
          avatarUrl: `${process.env.APP_URL}/static/default_avatar.png`,
        },
      });
    }
    // 4.更新登录时间
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
    // 5.双token
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, type: "access" }, { expiresIn: "15m" });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: "refresh",
        jti: randomUUID(),
      },
      {
        expiresIn: "7d",
      },
    );

    // redis 存hash
    const tokenHash = this.hashToken(refreshToken);

    await this.redis.setex(`refresh:${user.id}:${deviceId}`, 7 * 24 * 3600, tokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        isNewUser,
      },
    };
  }

  /**
   * 刷新token
   */
  async refresh(refreshToken: string, deviceId: string) {
    try {
      // 1. 验证refrsh token
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== "refresh") {
        throw new UnauthorizedException();
      }
      // 2. 对比
      const tokenHash = this.hashToken(refreshToken);

      const cached = await this.redis.get(`refresh:${payload.sub}:${deviceId}`);

      if (!cached || cached !== tokenHash) {
        throw new UnauthorizedException("Refresh Token 已失效");
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          status: "ACTIVE",
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      // 新 access
      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: "access",
        },
        {
          expiresIn: "15m",
        },
      );

      // 新 refresh
      const newRefreshToken = this.jwtService.sign(
        {
          sub: user.id,
          type: "refresh",
          jti: randomUUID(),
        },
        {
          expiresIn: "7d",
        },
      );

      await this.redis.setex(`refresh:${user.id}:${deviceId}`, 7 * 24 * 3600, this.hashToken(newRefreshToken));

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    } catch (e) {
      throw new UnauthorizedException("登录已过期，请重新登录");
    }
  }

  /**
   * 退出登录
   */
  async logout(userId: number, deviceId: string) {
    await this.redis.del(`refresh:${userId}:${deviceId}`);
    return { success: true };
  }
}

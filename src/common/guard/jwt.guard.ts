import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("缺少 Token");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // 确保是 access token
      if (payload.type !== "access") {
        throw new UnauthorizedException("Token 类型错误");
      }
      request.user = payload; // 后续控制器通过 @Req() 取用户信息
      return true;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token 已过期，请刷新");
      }
      throw new UnauthorizedException("Token 无效");
    }
  }
}

import { Controller, Post, Body, Res, Req, UsePipes, ValidationPipe } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { SendCodeDto } from "./dto/send-code.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("send-code")
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendCode(@Body() body: SendCodeDto) {
    await this.authService.sendCode(body.email);
  }

  @Post("login")
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.login(body.email, body.code, body.deviceId);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post("refresh")
  async refresh(
    @Req() req: any,
    @Body("deviceId")
    deviceId: string,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const token = req.cookies.refreshToken;
    const result = await this.authService.refresh(token, deviceId);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return {
      accessToken: result.accessToken,
    };
  }
}

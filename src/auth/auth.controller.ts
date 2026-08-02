import { Controller, Post, Body, Res, Req } from "@nestjs/common";

import { Response } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(
    @Body() body: any,
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

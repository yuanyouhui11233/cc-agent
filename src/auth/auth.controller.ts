import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SendCodeDto } from "./dto/send-code.dto";
import { LoginDto } from "./dto/login.dto";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("send-code")
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendCode(@Body() body: SendCodeDto) {
    console.log(body.email);
    await this.authService.sendCode(body.email);

    return {
      message: "验证码已发送",
    };
  }

  @Post("login")
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.code);
  }
}

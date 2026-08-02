import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "邮箱格式不正确" })
  @IsNotEmpty({ message: "邮箱不能为空" })
  email: string;
  @IsNotEmpty({ message: "验证码不能为空" })
  @Length(6, 6, { message: "验证码必须为6位" })
  code: string;
}

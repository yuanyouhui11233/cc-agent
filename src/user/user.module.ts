import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { CommonAuthModule } from "../common/auth/auth.module";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [CommonAuthModule],
})
export class UserModule {}

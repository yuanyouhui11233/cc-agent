import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtGuard } from "../guard/jwt.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  providers: [JwtGuard],
  exports: [JwtModule, JwtGuard],
})
export class CommonAuthModule {}

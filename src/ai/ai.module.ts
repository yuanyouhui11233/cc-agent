import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiProviderService } from "./ai-provider.service";
import { DeepSeekProvider } from "./providers/deepseek.provider";

// AiModule：收口模型服务能力，后续可以继续扩展 provider-specific adapter。
@Module({
  imports: [ConfigModule],
  providers: [AiProviderService, DeepSeekProvider],
  exports: [AiProviderService],
})
export class AiModule {}

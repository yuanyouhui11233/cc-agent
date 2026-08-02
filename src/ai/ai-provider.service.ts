import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeepSeekProvider } from "./providers/deepseek.provider";

// AIProviderService：统一的大模型调用入口。
// 业务层只认这个统一入口；真正具体的请求发送动作由各厂商适配器实现。
@Injectable()
export class AiProviderService {
  constructor(
    private readonly configService: ConfigService,
    private readonly deepSeekProvider: DeepSeekProvider,
  ) {}

  // getConfig：读取统一配置项。
  // 未来如果还要支持 OpenAI / Qwen，只要继续扩展 provider 分支即可。
  getConfig() {
    return {
      provider: this.configService.get<string>("AI_PROVIDER", "deepseek"),
      baseUrl: this.configService.get<string>("AI_BASE_URL", "https://api.deepseek.com"),
      apiKey: this.configService.get<string>("AI_API_KEY", ""),
      model: this.configService.get<string>("AI_MODEL", "deepseek-chat"),
      temperature: this.configService.get<number>("AI_TEMPERATURE", 0.7),
      maxTokens: this.configService.get<number>("AI_MAX_TOKENS", 2048),
    };
  }

  // createChatCompletion：统一对外暴露的方法。
  // 当前只实现 DeepSeek 分支，后续若扩展其他厂商，可以在这里增加 switch / case。
  async createChatCompletion(messages: Array<{ role: string; content: string }>) {
    const { provider } = this.getConfig();

    switch (provider) {
      case "deepseek":
        return this.deepSeekProvider.createChatCompletion(messages);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// DeepSeekProvider：给 DeepSeek 专门做的具体适配器。
// 它负责读 DeepSeek 相关配置，并把统一的消息输入转换成 DeepSeek 可接受的请求。
@Injectable()
export class DeepSeekProvider {
  constructor(private readonly configService: ConfigService) {}

  // 读取当前 DeepSeek 所需的配置项。
  private getConfig() {
    return {
      apiKey: this.configService.get<string>("AI_API_KEY", ""),
      baseUrl: this.configService.get<string>("AI_BASE_URL", "https://api.deepseek.com"),
      model: this.configService.get<string>("AI_MODEL", "deepseek-chat"),
      temperature: this.configService.get<number>("AI_TEMPERATURE", 0.7),
      maxTokens: this.configService.get<number>("AI_MAX_TOKENS", 2048),
    };
  }

  // createChatCompletion：把统一消息格式转换成 DeepSeek 的聊天接口请求。
  // 当前我们优先采用 OpenAI 兼容的 `/chat/completions` 结构，因此 DeepSeek 可直接复用这一套。
  async createChatCompletion(messages: Array<{ role: string; content: string }>) {
    const { apiKey, baseUrl, model, temperature, maxTokens } = this.getConfig();

    if (!apiKey) {
      throw new Error("AI_API_KEY is required when using the DeepSeek provider.");
    }

    const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();

    // 兼容 OpenAI / DeepSeek 的返回形态：取第一条 assistant 消息的内容即可。
    return payload.choices?.[0]?.message?.content ?? payload;
  }
}

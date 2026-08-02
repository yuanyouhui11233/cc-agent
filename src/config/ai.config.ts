// AI 配置中心：统一收口模型服务的厂商、地址、密钥和模型参数。
// 这样后续如果要从 DeepSeek 切到 OpenAI / Qwen / 其他兼容接口，业务层只需要依赖统一字段，
// 不需要在每个调用点重新写一套环境变量名。
export const aiConfig = () => ({
  // AI_PROVIDER：当前使用的模型厂商，例如 deepseek / openai / qwen
  AI_PROVIDER: process.env.AI_PROVIDER ?? "deepseek",

  // AI_BASE_URL：厂商提供的基础地址，便于动态切换不同网关或兼容接口
  AI_BASE_URL: process.env.AI_BASE_URL ?? "https://api.deepseek.com",

  // AI_API_KEY：当前模型服务的鉴权密钥
  AI_API_KEY: process.env.AI_API_KEY ?? "",

  // AI_MODEL：当前使用的具体模型名
  AI_MODEL: process.env.AI_MODEL ?? "deepseek-chat",

  // AI_TEMPERATURE：采样温度，控制输出随机性
  AI_TEMPERATURE: Number(process.env.AI_TEMPERATURE ?? 0.7),

  // AI_MAX_TOKENS：单次响应最大 token 数
  AI_MAX_TOKENS: Number(process.env.AI_MAX_TOKENS ?? 2048),
});

export const aiConfig = () => ({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o",
  AI_TEMPERATURE: Number(process.env.AI_TEMPERATURE ?? 0.7),
  AI_MAX_TOKENS: Number(process.env.AI_MAX_TOKENS ?? 2048),
});

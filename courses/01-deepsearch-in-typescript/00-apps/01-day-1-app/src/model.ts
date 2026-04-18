import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "~/env";

export const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

export const model = openrouter("anthropic/claude-3-5-haiku");

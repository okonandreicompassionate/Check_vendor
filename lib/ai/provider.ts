 import type { AIProvider } from "./index";
import { RulesProvider } from "./rules";
import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";

const providers: Record<string, AIProvider> = {
  rules: new RulesProvider(),
  claude: new ClaudeProvider(),
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
};

// Change AI_PROVIDER in .env.local to swap — no other code changes needed
const selected = process.env.AI_PROVIDER ?? "rules";

export const ai = providers[selected] ?? providers.rules;

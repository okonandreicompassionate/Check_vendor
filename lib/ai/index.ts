import { GroqProvider } from "./groq";
import { RulesProvider } from "./rules";
import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AIProvider } from "./types";

export const ai: Record<string, AIProvider> = {
  rules: new RulesProvider(),
  claude: new ClaudeProvider(),
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
  groq: new GroqProvider(), // 🔥 ADD THIS
};
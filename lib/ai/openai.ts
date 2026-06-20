 import type { AIProvider, SentimentResult, FakeDetectionResult } from "./index";

export class OpenAIProvider implements AIProvider {
  async analyzeSentiment(reviews: string[]): Promise<SentimentResult> {
    // TODO: wire up when OPENAI_API_KEY is set
    return { sentiment: "mixed", summary: "OpenAI not configured yet.", score: 50 };
  }

  async detectFakeReviews(reviews: { comment: string | null; created_at: string }[]): Promise<FakeDetectionResult> {
    return { suspicion_score: 0, red_flags: [], is_suspicious: false };
  }

  async summarizeVendor(reviews: string[]): Promise<string> {
    return "OpenAI not configured yet.";
  }
}

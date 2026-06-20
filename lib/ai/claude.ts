import type { AIProvider, SentimentResult, FakeDetectionResult } from "./index";

export class ClaudeProvider implements AIProvider {
  async analyzeSentiment(reviews: string[]): Promise<SentimentResult> {
    // TODO: wire up when ANTHROPIC_API_KEY is set
    return { sentiment: "mixed", summary: "Claude not configured yet.", score: 50 };
  }

  async detectFakeReviews(reviews: { comment: string | null; created_at: string }[]): Promise<FakeDetectionResult> {
    return { suspicion_score: 0, red_flags: [], is_suspicious: false };
  }

  async summarizeVendor(reviews: string[]): Promise<string> {
    return "Claude not configured yet.";
  }
} 

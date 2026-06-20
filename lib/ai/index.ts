// ─── Result Types ─────────────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: "positive" | "negative" | "mixed";
  summary: string;
  score: number; // 0-100
}

export interface FakeDetectionResult {
  suspicion_score: number; // 0-100
  red_flags: string[];
  is_suspicious: boolean;
}

// ─── Provider Interface ───────────────────────────────────────────────────────
// Every AI provider (Claude, OpenAI, Gemini, rules) must implement these 3 methods.
// Your app never calls any provider directly — always through this interface.

export interface AIProvider {
  analyzeSentiment(reviews: string[]): Promise<SentimentResult>;
  detectFakeReviews(reviews: { comment: string | null; created_at: string }[]): Promise<FakeDetectionResult>;
  summarizeVendor(reviews: string[]): Promise<string>;
} 

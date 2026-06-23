import { AIProvider, SentimentResult, FakeDetectionResult } from "./types";
import { z } from "zod";

const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "negative", "mixed"]),
  summary: z.string(),
  score: z.number().min(0).max(100),
});

const FakeSchema = z.object({
  suspicion_score: z.number().min(0).max(100),
  red_flags: z.array(z.string()),
  is_suspicious: z.boolean(),
});

export class GroqProvider implements AIProvider {
  private apiKey = process.env.GROQ_API_KEY!;
  private url = "https://api.groq.com/openai/v1/chat/completions";

  private async call(body: object) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      console.log("CALLING GROQ API");

      const res = await fetch(this.url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("GROQ STATUS:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("GROQ ERROR:", text);
        throw new Error(`Groq error: ${res.status}`);
      }

      const data = await res.json();
      console.log("GROQ JSON RECEIVED");

      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty Groq response");

      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  async analyzeSentiment(reviews: string[]): Promise<SentimentResult> {
    try {
      console.log("CALLING GROQ SENTIMENT");

      if (reviews.length === 0) {
        return {
          sentiment: "mixed",
          summary: "No reviews submitted yet for this vendor.",
          score: 50,
        };
      }

      const content = await this.call({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a vendor trust analyst for a Nigerian e-commerce safety platform.

You will be given a list of community reviews about a vendor.
Analyse the reviews and return ONLY a JSON object with EXACTLY these three fields:

{
  "sentiment": "positive" | "negative" | "mixed",
  "summary": "2-4 sentence balanced summary of what reviewers said",
  "score": 0-100
}

Rules:
- "sentiment" MUST be exactly one of: "positive", "negative", "mixed"
- "summary" MUST be a plain string. Write it like a neutral journalist. Do not use bullet points.
- "score" MUST be a number between 0 and 100. 0 = all scam reports, 100 = all positive.
- Do NOT add any extra fields.
- Do NOT wrap in markdown or code blocks.
- Return ONLY the JSON object, nothing else.`,
          },
          {
            role: "user",
            content: `Here are the vendor reviews to analyse:\n\n${reviews.map((r, i) => `Review ${i + 1}: ${r}`).join("\n")}`,
          },
        ],
      });

      console.log("RAW SENTIMENT:", content);

      // Strip any markdown fences just in case
      const cleaned = content.replace(/```json|```/g, "").trim();
      return SentimentSchema.parse(JSON.parse(cleaned));

    } catch (err) {
      console.error("GROQ SENTIMENT FAILED:", err);
      return {
        sentiment: "mixed",
        summary: "AI analysis unavailable. Score is based on community votes only.",
        score: 50,
      };
    }
  }

  async detectFakeReviews(
    reviews: { comment: string | null; created_at: string }[]
  ): Promise<FakeDetectionResult> {
    try {
      console.log("CALLING GROQ FAKE DETECTION");

      if (reviews.length < 2) {
        return { suspicion_score: 0, red_flags: [], is_suspicious: false };
      }

      const content = await this.call({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a fraud detection system for a Nigerian vendor trust platform.

You will be given a list of reviews with comments and timestamps.
Detect signs of fake or coordinated reviews and return ONLY a JSON object with EXACTLY these three fields:

{
  "suspicion_score": 0-100,
  "red_flags": ["string", "string"],
  "is_suspicious": true | false
}

Rules:
- "suspicion_score" MUST be a number between 0 and 100. 0 = looks genuine, 100 = highly suspicious.
- "red_flags" MUST be an array of strings. Each string describes one specific suspicious pattern found. Empty array [] if none found.
- "is_suspicious" MUST be a boolean: true if suspicion_score > 30, false otherwise.
- Signs to look for: duplicate comments, reviews submitted within seconds of each other, all same verdict, very short identical comments, bot-like language.
- Do NOT add any extra fields.
- Do NOT wrap in markdown or code blocks.
- Return ONLY the JSON object, nothing else.`,
          },
          {
            role: "user",
            content: `Here are the reviews to analyse for fake activity:\n\n${JSON.stringify(reviews, null, 2)}`,
          },
        ],
      });

      console.log("RAW FAKE DETECTION:", content);

      const cleaned = content.replace(/```json|```/g, "").trim();
      return FakeSchema.parse(JSON.parse(cleaned));

    } catch (err) {
      console.error("GROQ FAKE DETECTION FAILED:", err);
      return { suspicion_score: 0, red_flags: [], is_suspicious: false };
    }
  }

  async summarizeVendor(reviews: string[]): Promise<string> {
    try {
      if (reviews.length === 0) return "No reviews submitted yet for this vendor.";

      const content = await this.call({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a vendor trust analyst for a Nigerian e-commerce safety platform.
Summarize the vendor's reputation in 3-5 sentences based on community reviews.
Be balanced, factual, and neutral. Do not accuse or defame — only reflect what reviewers said.
Write in plain English. No bullet points. No markdown.`,
          },
          {
            role: "user",
            content: `Summarize this vendor based on these reviews:\n\n${reviews.map((r, i) => `Review ${i + 1}: ${r}`).join("\n")}`,
          },
        ],
      });

      return content;
    } catch (err) {
      console.error("GROQ SUMMARY FAILED:", err);
      return "Summary unavailable.";
    }
  }
}
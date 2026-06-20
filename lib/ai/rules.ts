import type { AIProvider, SentimentResult, FakeDetectionResult } from "./index";

// Nigerian and general vendor scam signals
const SCAM_SIGNALS = [
  // English scam words
  "scam", "fraud", "fake", "thief", "liar", "cheat", "dishonest",
  "never delivered", "never came", "did not deliver", "no delivery",
  "ghosted", "ghost", "blocked me", "blocked after", "ran away",
  "disappeared", "no response", "stopped responding", "not responding",
  "wrong item", "fake item", "inferior", "substandard", "bad quality",
  "not original", "not genuine", "counterfeit", "replica sent",
  "took my money", "stole", "collected money", "ran with my money",
  "do not buy", "avoid", "beware", "warning", "reported",
  "refund refused", "no refund", "wont refund", "refused refund",
  // Nigerian Pidgin scam signals
  "e scam me", "dem scam", "419", "e fraud me", "na scammer",
  "no send", "no deliver", "take my money run", "collect money disappear",
  "e block me", "dem block", "fake product", "e no send",
  "story story", "packaging bad", "e cheat me", "e lie",
  "no pick call", "switched off", "number off",
];

const LEGIT_SIGNALS = [
  // English legit words
  "legit", "trusted", "reliable", "genuine", "original", "authentic",
  "fast delivery", "quick delivery", "delivered on time", "arrived quickly",
  "good quality", "great quality", "excellent quality", "high quality",
  "real product", "as described", "as advertised", "exactly as shown",
  "good packaging", "well packaged", "neatly packaged",
  "responsive", "quick response", "fast response", "replies quickly",
  "professional", "honest", "transparent", "recommend",
  "will buy again", "would buy again", "buying again", "repurchase",
  "satisfied", "happy with", "love my", "great vendor", "good vendor",
  "trustworthy", "dependable", "no issues", "smooth transaction",
  // Nigerian Pidgin legit signals
  "e legit", "dem legit", "e deliver", "e send am", "quick quick",
  "e respond", "no wahala", "smooth", "e genuine", "original product",
  "e trustworthy", "buy from am again", "e real", "correct vendor",
  "e fast", "packaging fine", "e honest",
];

const NEUTRAL_SIGNALS = [
  "okay", "average", "normal", "so so", "not bad", "could be better",
  "late delivery", "delayed", "slow delivery", "took long",
  "price high", "expensive", "pricey",
];

// Phrases that strongly indicate a scam (weighted higher)
const STRONG_SCAM_PHRASES = [
  "blocked me after payment", "took money and disappeared",
  "collected money and blocked", "419", "do not buy from",
  "scammed me", "he scammed", "she scammed", "they scammed",
  "never received", "paid and never", "sent wrong",
  "e collect my money", "ran with", "absconded",
];

const STRONG_LEGIT_PHRASES = [
  "highly recommend", "100% legit", "very trustworthy",
  "always delivers", "best vendor", "top vendor",
  "been buying for years", "long time customer",
  "never disappointed", "always on time",
];

function countSignals(text: string, signals: string[]): number {
  return signals.filter((s) => text.includes(s)).length;
}

function buildSummary(
  reviews: string[],
  legitCount: number,
  scamCount: number,
  neutralCount: number,
  strongScamHits: number,
  strongLegitHits: number,
  sentiment: "positive" | "negative" | "mixed"
): string {
  const total = reviews.length;

  if (total === 0) {
    return "No community reviews have been submitted for this vendor yet. Be the first to share your experience.";
  }

  if (total < 3) {
    return `Only ${total} review${total !== 1 ? "s" : ""} submitted so far — not enough data for a reliable assessment. More community reviews are needed before drawing conclusions.`;
  }

  const parts: string[] = [];

  // Opening line
  if (sentiment === "positive") {
    parts.push(`Based on ${total} community reviews, this vendor has a generally positive reputation.`);
  } else if (sentiment === "negative") {
    parts.push(`Based on ${total} community reviews, this vendor has raised significant concerns in the community.`);
  } else {
    parts.push(`Based on ${total} community reviews, this vendor has a mixed reputation.`);
  }

  // Breakdown
  if (legitCount > 0 && scamCount > 0) {
    parts.push(`${legitCount} reviewer${legitCount !== 1 ? "s" : ""} reported a positive experience, while ${scamCount} reported a negative one.`);
  } else if (legitCount > 0) {
    parts.push(`All ${legitCount} reviewer${legitCount !== 1 ? "s" : ""} reported a positive experience.`);
  } else if (scamCount > 0) {
    parts.push(`All ${scamCount} reviewer${scamCount !== 1 ? "s" : ""} reported a negative experience.`);
  }

  // Strong signals
  if (strongScamHits >= 2) {
    parts.push("Multiple reviewers used strong language indicating fraud or non-delivery.");
  }
  if (strongLegitHits >= 2) {
    parts.push("Multiple reviewers strongly vouched for this vendor's reliability.");
  }

  // Neutral signals
  if (neutralCount > 0 && sentiment === "mixed") {
    parts.push("Some reviewers noted issues with delivery speed or pricing but did not report fraud.");
  }

  // Closing balanced line
  if (sentiment === "mixed") {
    parts.push("As with any online vendor, exercise reasonable caution and consider starting with a smaller order.");
  } else if (sentiment === "negative") {
    parts.push("Community data suggests caution is warranted before transacting with this vendor.");
  } else {
    parts.push("Community data suggests this vendor has a track record of satisfactory transactions.");
  }

  return parts.join(" ");
}

export class RulesProvider implements AIProvider {

  async analyzeSentiment(reviews: string[]): Promise<SentimentResult> {
    if (reviews.length === 0) {
      return {
        sentiment: "mixed",
        summary: "No community reviews have been submitted for this vendor yet. Be the first to share your experience.",
        score: 50,
      };
    }

    let totalPos = 0;
    let totalNeg = 0;
    let totalNeutral = 0;
    let strongScamHits = 0;
    let strongLegitHits = 0;

    for (const review of reviews) {
      const lower = review.toLowerCase();

      // Strong phrases weighted x3
      const strongScam = countSignals(lower, STRONG_SCAM_PHRASES);
      const strongLegit = countSignals(lower, STRONG_LEGIT_PHRASES);
      strongScamHits += strongScam;
      strongLegitHits += strongLegit;

      totalNeg += strongScam * 3;
      totalPos += strongLegit * 3;

      // Regular signals weighted x1
      totalNeg += countSignals(lower, SCAM_SIGNALS);
      totalPos += countSignals(lower, LEGIT_SIGNALS);
      totalNeutral += countSignals(lower, NEUTRAL_SIGNALS);
    }

    const total = totalPos + totalNeg || 1;
    const score = Math.round(Math.max(0, Math.min(100, (totalPos / total) * 100)));

    const sentiment: "positive" | "negative" | "mixed" =
      totalNeg > totalPos * 1.2 ? "negative"
      : totalPos > totalNeg * 1.2 ? "positive"
      : "mixed";

    // Count legit vs scam reviews for summary
    const legitCount = reviews.filter((r) => {
      const lower = r.toLowerCase();
      return countSignals(lower, LEGIT_SIGNALS) + countSignals(lower, STRONG_LEGIT_PHRASES) * 3 >
             countSignals(lower, SCAM_SIGNALS) + countSignals(lower, STRONG_SCAM_PHRASES) * 3;
    }).length;

    const scamCount = reviews.filter((r) => {
      const lower = r.toLowerCase();
      return countSignals(lower, SCAM_SIGNALS) + countSignals(lower, STRONG_SCAM_PHRASES) * 3 >
             countSignals(lower, LEGIT_SIGNALS) + countSignals(lower, STRONG_LEGIT_PHRASES) * 3;
    }).length;

    const neutralCount = reviews.length - legitCount - scamCount;

    const summary = buildSummary(
      reviews,
      legitCount,
      scamCount,
      neutralCount,
      strongScamHits,
      strongLegitHits,
      sentiment
    );

    return { sentiment, summary, score };
  }

  async detectFakeReviews(
    reviews: { comment: string | null; created_at: string }[]
  ): Promise<FakeDetectionResult> {
    const red_flags: string[] = [];

    if (reviews.length < 2) {
      return { suspicion_score: 0, red_flags: [], is_suspicious: false };
    }

    // Check for reviews submitted too close together (within 2 minutes)
    const timestamps = reviews.map((r) => new Date(r.created_at).getTime()).sort();
    let burstCount = 0;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i - 1] < 120_000) burstCount++;
    }
    if (burstCount >= 2) {
      red_flags.push("Multiple reviews were submitted within a very short time period.");
    }

    // Check for duplicate or near-duplicate comments
    const comments = reviews
      .map((r) => r.comment?.toLowerCase().trim().replace(/\s+/g, " "))
      .filter(Boolean) as string[];

    const seen = new Set<string>();
    let dupeCount = 0;
    for (const c of comments) {
      if (seen.has(c)) dupeCount++;
      seen.add(c);
    }
    if (dupeCount > 0) {
      red_flags.push(`${dupeCount} duplicate comment${dupeCount !== 1 ? "s" : ""} detected.`);
    }

    // Check for very short identical-length comments (bot pattern)
    const shortComments = comments.filter((c) => c.length < 10);
    if (shortComments.length > reviews.length * 0.5 && reviews.length > 3) {
      red_flags.push("Unusually high number of very short comments — possible bot activity.");
    }

    // Check if all reviews have the same verdict (suspicious if many)
    const allSameVerdict = reviews.length >= 5 &&
      reviews.every((r, _, arr) =>
        (r as any).verdict === (arr[0] as any).verdict
      );
    if (allSameVerdict) {
      red_flags.push("All reviews share the same verdict — this pattern can indicate coordinated activity.");
    }

    const suspicion_score = Math.min(red_flags.length * 30, 100);

    return {
      suspicion_score,
      red_flags,
      is_suspicious: red_flags.length > 0,
    };
  }

  async summarizeVendor(reviews: string[]): Promise<string> {
    if (reviews.length === 0) return "No reviews yet for this vendor.";
    const result = await this.analyzeSentiment(reviews);
    return result.summary;
  }
}

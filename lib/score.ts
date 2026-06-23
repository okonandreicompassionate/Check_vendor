import type { Review } from "./supabase";
import type { SentimentResult, FakeDetectionResult } from "./ai/index";

export type TrustVerdict =
  | "unverified"
  | "mostly_legit"
  | "mixed"
  | "high_risk"
  | "flagged";

export interface ScoreBreakdown {
  trust_score: number;
  verdict: TrustVerdict;
  total_reviews: number;
  legit_count: number;
  scam_count: number;
  summary: string;
  sources: string[];
  advice: string[];
  red_flags: string[];
  is_suspicious: boolean;
}

export function calculateScore(
  reviews: Review[],
  sentiment: SentimentResult,
  fakeDetection: FakeDetectionResult,
  flagged: boolean
): ScoreBreakdown {

  const total = reviews.length;
  const legitCount = reviews.filter((r) => r.verdict === "legit").length;
  const scamCount = reviews.filter((r) => r.verdict === "scammed").length;
  const scamPercent = total > 0 ? scamCount / total : 0;

  let score = total > 0 ? Math.round((legitCount / total) * 100) : 0;

  if (scamPercent > 0.6) score -= 40;
  else if (scamPercent > 0.3) score -= 20;
  if (fakeDetection.is_suspicious) score -= 15;
  if (flagged) score = Math.min(score, 20);

  if (total >= 10 && scamPercent < 0.1) score += 10;
  if (sentiment.sentiment === "positive") score += 5;

  score = Math.max(0, Math.min(100, score));

  let verdict: TrustVerdict;
  if (flagged) verdict = "flagged";
  else if (total < 2) verdict = "unverified";
  else if (score >= 70) verdict = "mostly_legit";
  else if (score >= 40) verdict = "mixed";
  else verdict = "high_risk";

  const sources: string[] = [];

  if (total === 0) {
    sources.push("No community reviews have been submitted for this vendor yet.");
  } else {
    sources.push(`${total} community review${total !== 1 ? "s" : ""} submitted on Vendorfy.`);

    if (legitCount > 0)
      sources.push(`${legitCount} reviewer${legitCount !== 1 ? "s" : ""} reported a positive transaction.`);

    if (scamCount > 0)
      sources.push(`${scamCount} reviewer${scamCount !== 1 ? "s" : ""} reported a negative experience.`);

    if (scamPercent > 0.3 && scamPercent <= 0.6)
      sources.push("Over 30% of reviews report a negative experience — higher than average.");

    if (scamPercent > 0.6)
      sources.push("Over 60% of reviews report a negative experience — significantly above average.");

    if (total >= 10 && scamPercent < 0.1)
      sources.push("10+ reviews with fewer than 10% negative reports — strong community trust signal.");

    if (fakeDetection.red_flags.length > 0)
      fakeDetection.red_flags.forEach((flag) =>
        sources.push(`Automated check flagged: ${flag}.`)
      );
  }

  // Use Groq summary always if available, fallback only when truly needed
  const summary =
    verdict === "flagged"
      ? "This vendor has been flagged for review by our moderation team."
      : total === 0
      ? "No reviews submitted yet for this vendor. Be the first to share your experience."
      : sentiment.summary;

  const advice: string[] = [];

  if (verdict === "unverified") {
    advice.push("Ask the vendor for references or proof of previous transactions.");
    advice.push("Consider starting with a small order before committing to a large purchase.");
    advice.push("Request delivery confirmation or tracking where possible.");
  }

  if (verdict === "mostly_legit") {
    advice.push("Community reports suggest this vendor has a positive track record.");
    advice.push("As with any online transaction, consider using a secure payment method.");
  }

  if (verdict === "mixed") {
    advice.push("Community reports are mixed — proceed with caution.");
    advice.push("Request proof of product (photos/videos) before paying.");
    advice.push("Consider using an escrow service or paying on delivery where available.");
    advice.push("Ask for references from previous buyers before transacting.");
  }

  if (verdict === "high_risk") {
    advice.push("Community reports for this vendor are predominantly negative.");
    advice.push("Exercise significant caution before transacting with this vendor.");
    advice.push("Request verifiable proof of identity and previous transactions.");
    advice.push("Consider using a third-party escrow service to protect your funds.");
  }

  if (verdict === "flagged") {
    advice.push("This vendor is currently under review by our moderation team.");
    advice.push("We recommend waiting until the review is complete before transacting.");
  }

  if (fakeDetection.is_suspicious) {
    advice.push("Some reviews for this vendor have triggered our automated checks — treat the score with caution.");
  }

  return {
    trust_score: score,
    verdict,
    total_reviews: total,
    legit_count: legitCount,
    scam_count: scamCount,
    summary,
    sources,
    advice,
    red_flags: fakeDetection.red_flags,
    is_suspicious: fakeDetection.is_suspicious,
  };
}
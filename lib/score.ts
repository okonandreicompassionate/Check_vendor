 import type { Review } from "./supabase";
import type { SentimentResult, FakeDetectionResult } from "./ai/index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrustVerdict =
  | "unverified"    // < 3 reviews
  | "mostly_legit"  // score 70-100
  | "mixed"         // score 40-69
  | "high_risk"     // score 0-39
  | "flagged";      // manually flagged by admin

export interface ScoreBreakdown {
  trust_score: number;
  verdict: TrustVerdict;
  total_reviews: number;
  legit_count: number;
  scam_count: number;
  summary: string;
  sources: string[];       // factual bullet points sourced from community data
  advice: string[];        // neutral safety tips, never accusatory
  red_flags: string[];     // from fake detection
  is_suspicious: boolean;
}

// ─── Score Calculator ─────────────────────────────────────────────────────────

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

  // ── Base score ──────────────────────────────────────────────────────────────
  let score = total > 0 ? Math.round((legitCount / total) * 100) : 0;

  // ── Penalties ───────────────────────────────────────────────────────────────
  if (scamPercent > 0.6) score -= 40;
  else if (scamPercent > 0.3) score -= 20;
  if (fakeDetection.is_suspicious) score -= 15;
  if (flagged) score = Math.min(score, 20);

  // ── Bonuses ─────────────────────────────────────────────────────────────────
  if (total >= 10 && scamPercent < 0.1) score += 10;
  if (sentiment.sentiment === "positive") score += 5;

  // ── Clamp 0-100 ─────────────────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score));

  // ── Verdict ─────────────────────────────────────────────────────────────────
  let verdict: TrustVerdict;
  if (flagged) verdict = "flagged";
  else if (total < 3) verdict = "unverified";
  else if (score >= 70) verdict = "mostly_legit";
  else if (score >= 40) verdict = "mixed";
  else verdict = "high_risk";

  // ── Sources (factual, community-attributed) ──────────────────────────────────
  const sources: string[] = [];

  if (total === 0) {
    sources.push("No community reviews have been submitted for this vendor yet.");
  } else {
    sources.push(`${total} community review${total !== 1 ? "s" : ""} submitted on CheckVendor.`);

    if (legitCount > 0)
      sources.push(`${legitCount} reviewer${legitCount !== 1 ? "s" : ""} reported a positive transaction.`);

    if (scamCount > 0)
      sources.push(`${scamCount} reviewer${scamCount !== 1 ? "s" : ""} reported a negative experience.`);

    if (scamPercent > 0.3 && scamPercent <= 0.6)
      sources.push(`Over 30% of reviews report a negative experience — higher than average.`);

    if (scamPercent > 0.6)
      sources.push(`Over 60% of reviews report a negative experience — significantly above average.`);

    if (total >= 10 && scamPercent < 0.1)
      sources.push(`10+ reviews with fewer than 10% negative reports — strong community trust signal.`);

    if (fakeDetection.red_flags.length > 0)
      fakeDetection.red_flags.forEach((flag) =>
        sources.push(`Automated check flagged: ${flag}.`)
      );
  }

  // ── Summary (AI-generated or fallback) ───────────────────────────────────────
  const summary =
    verdict === "unverified"
      ? "This vendor has not yet received enough reviews for a reliable trust assessment."
      : verdict === "flagged"
      ? "This vendor has been flagged for review by our moderation team."
      : sentiment.summary;

  // ── Advice (neutral, never accusatory) ───────────────────────────────────────
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

import { ai } from "@/lib/ai";
import { calculateFinalScore } from "@/lib/ai/scoring";
import {
  calculateAgreement,
  calculateConfidence,
} from "@/lib/ai/confidence";
import { scoreWebEvidence } from "@/lib/ai/webEvidence";
import {
  discoverVendor,
} from "@/app/api/services/discovery";
import {
  scrapeUrls,
} from "@/app/api/services/scraper";
import {
  extractEvidence,
} from "@/app/api/services/evidence";

export async function GET(
  req: Request,
  { params }: { params: { handle: string } }
) {
  const vendor = params.handle;

  // 1. reviews (you already have this logic)
  const reviews = []; // keep your existing DB fetch

  // 2. rules engine
  const rules =
    await ai.rules.analyzeSentiment(
      reviews.map((r) => r.comment)
    );

  // 3. fake detection
  const fake =
    await ai.groq.detectFakeReviews(reviews);

  // 4. web discovery
  const discovered =
    await discoverVendor(vendor);

  // 5. scraping + evidence
  const evidence = [];

  for (const d of discovered.slice(0, 5)) {
    try {
      const markdown =
        await scrapeUrl(d.url);

      const e =
        await extractEvidence(
          markdown,
          d.url
        );

      evidence.push(e);
    } catch {}
  }

  // 6. web score
  const webScore =
    scoreWebEvidence(evidence);

  // 7. AI truth model
  const aiTruth =
    await ai.groq.analyzeVendorTruth({
      vendor,
      reviews: reviews.map(
        (r) => r.comment ?? ""
      ),
      webEvidence: evidence,
    });

  // 8. agreement
  const agreement =
    calculateAgreement({
      rulesScore: rules.score,
      aiScore:
        aiTruth.confidence ?? 70,
      webScore,
    });

  // 9. confidence
  const confidence =
    calculateConfidence({
      reviewCount: reviews.length,
      aiConfidence:
        aiTruth.confidence ?? 70,
      sourceCount: evidence.length,
      agreementScore: agreement,
    });

  // 10. final score
  const score =
    calculateFinalScore({
      communityScore: rules.score,
      fakeScore:
        100 - fake.suspicion_score,
      webScore,
      aiConfidence: confidence,
    });

  return Response.json({
    vendor,
    rules,
    fake,
    webScore,
    aiTruth,
    confidence,
    score,
    evidence,
  });
}
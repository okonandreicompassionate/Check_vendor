export interface ReputationInput {
  communityScore: number;
  fakeScore: number;
  webScore: number;
  aiConfidence: number;
}

export function calculateReputation(
  input: ReputationInput
) {
  const finalScore =
    input.communityScore * 0.4 +
    input.fakeScore * 0.15 +
    input.webScore * 0.3 +
    input.aiConfidence * 0.15;

  let verdict =
    finalScore >= 70
      ? "Likely Legit"
      : finalScore >= 40
      ? "Mixed Risk"
      : "High Risk";

  return {
    final_score: Math.round(finalScore),
    verdict,
    confidence: Math.round(
      (input.aiConfidence + input.webScore) / 2
    ),
  };
}
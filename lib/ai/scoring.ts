export function calculateFinalScore(input: {
  communityScore: number;
  fakeScore: number;
  webScore: number;
  aiConfidence: number;
}) {
  const final =
    input.communityScore * 0.4 +
    input.fakeScore * 0.15 +
    input.webScore * 0.3 +
    input.aiConfidence * 0.15;

  return {
    final_score: Math.round(final),
    verdict:
      final >= 75
        ? "Likely Legit"
        : final >= 50
        ? "Mixed Risk"
        : "High Risk",
  };
}
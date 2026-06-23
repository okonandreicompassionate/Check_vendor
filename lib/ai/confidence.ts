export function calculateConfidence(input: {
  reviewCount: number;
  aiConfidence: number;
  sourceCount: number;
  agreementScore: number;
}) {
  const coverage = Math.min(
    100,
    input.reviewCount * 2 + input.sourceCount * 5
  );

  return Math.round(
    input.aiConfidence * 0.4 +
      input.agreementScore * 0.3 +
      coverage * 0.3
  );
}

export function calculateAgreement({
  rulesScore,
  aiScore,
  webScore,
}: {
  rulesScore: number;
  aiScore: number;
  webScore: number;
}) {
  const avgDiff =
    (Math.abs(rulesScore - aiScore) +
      Math.abs(aiScore - webScore) +
      Math.abs(rulesScore - webScore)) /
    3;

  return Math.max(0, 100 - avgDiff);
}
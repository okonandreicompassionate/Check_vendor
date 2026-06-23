export type WebEvidence = {
  source: string;
  url: string;
  reputationSignals: string[];
  scamSignals: string[];
  positiveSignals: string[];
  summary: string;
};

export function scoreWebEvidence(
  evidence: WebEvidence[]
) {
  let score = 50;

  for (const e of evidence) {
    score += e.positiveSignals.length * 3;
    score -= e.scamSignals.length * 6;
    score += e.reputationSignals.length * 2;
  }

  return Math.max(0, Math.min(100, score));
}
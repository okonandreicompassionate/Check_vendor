export interface EvidenceResult {
  source: string;
  url: string;
  reputationSignals: string[];
  scamSignals: string[];
  positiveSignals: string[];
  summary: string;
}

export async function extractEvidence(
  pages: any[],
  groq: any
): Promise<EvidenceResult[]> {
  const output = [];

  for (const page of pages) {
    const prompt = `
Analyze:

${page.markdown}

Return JSON:

{
 "reputationSignals":[],
 "scamSignals":[],
 "positiveSignals":[],
 "summary":""
}
`;

    const result = await groq.chat(prompt);

    output.push({
      source: page.metadata?.title ?? "Unknown",
      url: page.metadata?.sourceURL ?? "",
      ...JSON.parse(result),
    });
  }

  return output;
}
export interface TruthAnalysis {
  verdict: "legit" | "suspicious" | "scam";
  confidence: number;
  risks: string[];
  summary: string;
}

export async function analyzeTruth(
  vendor: string,
  reviews: string[],
  evidence: string[],
  groq: any
): Promise<TruthAnalysis> {
  const prompt = `
Vendor: ${vendor}

Reviews:
${reviews.join("\n")}

Evidence:
${evidence.join("\n")}

Return JSON:

{
  "verdict":"legit|suspicious|scam",
  "confidence":0-100,
  "risks":[""],
  "summary":""
}
`;

  const result = await groq.chat(prompt);

  return JSON.parse(result);
}
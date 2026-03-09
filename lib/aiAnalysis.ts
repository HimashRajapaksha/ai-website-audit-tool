import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuditMetrics, AuditResponse } from "@/types/audit";
import { buildAuditPrompts } from "./buildPrompt";

function extractJson(raw: string) {
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Model did not return valid JSON");
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString);
}

export async function runAiAnalysis(
  metrics: AuditMetrics
): Promise<AuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const { systemPrompt, userPrompt, structuredInput } = buildAuditPrompts(metrics);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const result = await model.generateContent([
    systemPrompt,
    userPrompt,
  ]);

  const rawOutput = result.response.text();
  const parsed = extractJson(rawOutput);

  return {
    metrics,
    insights: parsed.insights,
    recommendations: parsed.recommendations,
    promptLogs: {
      systemPrompt,
      userPrompt,
      structuredInput,
      rawOutput,
    },
  };
}
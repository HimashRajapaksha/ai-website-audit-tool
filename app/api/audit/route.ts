import { NextRequest, NextResponse } from "next/server";
import { fetchHtml } from "@/lib/fetchHtml";
import { extractMetrics } from "@/lib/extractMetrics";
import { runAiAnalysis } from "@/lib/aiAnalysis";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputUrl = body?.url;

    if (!inputUrl || typeof inputUrl !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const url = normalizeUrl(inputUrl);
    const html = await fetchHtml(url);
    const metrics = extractMetrics(html, url);
    const result = await runAiAnalysis(metrics);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to audit page";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
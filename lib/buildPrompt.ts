import { AuditMetrics } from "@/types/audit";

export function buildAuditPrompts(metrics: AuditMetrics) {
  const systemPrompt = `
You are a website audit assistant for a web agency.
Your task is to analyze a single webpage using factual metrics and visible page text.

Rules:
- Keep factual metrics separate from analysis.
- Ground every insight in the provided data.
- Be specific, not generic.
- Focus on SEO structure, messaging clarity, CTA usage, content depth, and UX/structural concerns.
- Provide 3 to 5 prioritized recommendations.
- Recommendations must be actionable and tied to evidence from the metrics.
- Return valid JSON only.
`;

  const structuredInput = {
    pageUrl: metrics.pageUrl,
    metrics: {
      wordCount: metrics.wordCount,
      headings: metrics.headings,
      ctaCount: metrics.ctaCount,
      internalLinks: metrics.internalLinks,
      externalLinks: metrics.externalLinks,
      imageCount: metrics.imageCount,
      imagesMissingAltPercent: metrics.imagesMissingAltPercent,
      metaTitle: metrics.metaTitle,
      metaDescription: metrics.metaDescription,
    },
    pageTextExcerpt: metrics.pageText,
  };

  const userPrompt = `
Analyze this webpage data and return JSON with exactly this shape:

{
  "insights": {
    "seoStructure": "string",
    "messagingClarity": "string",
    "ctaUsage": "string",
    "contentDepth": "string",
    "uxConcerns": "string"
  },
  "recommendations": [
    {
      "priority": 1,
      "title": "string",
      "reason": "string",
      "evidence": ["string", "string"]
    }
  ]
}

Input:
${JSON.stringify(structuredInput, null, 2)}
`;

  return {
    systemPrompt,
    userPrompt,
    structuredInput,
  };
}
export type AuditMetrics = {
  wordCount: number;
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
  ctaCount: number;
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  imagesMissingAltPercent: number;
  metaTitle: string;
  metaDescription: string;
  pageText: string;
  pageUrl: string;
};

export type AuditInsights = {
  seoStructure: string;
  messagingClarity: string;
  ctaUsage: string;
  contentDepth: string;
  uxConcerns: string;
};

export type Recommendation = {
  priority: number;
  title: string;
  reason: string;
  evidence: string[];
};

export type PromptLogs = {
  systemPrompt: string;
  userPrompt: string;
  structuredInput: unknown;
  rawOutput: string;
};

export type AuditResponse = {
  metrics: AuditMetrics;
  insights: AuditInsights;
  recommendations: Recommendation[];
  promptLogs: PromptLogs;
};
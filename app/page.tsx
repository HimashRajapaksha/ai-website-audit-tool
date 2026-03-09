"use client";

import { useState } from "react";

type AuditResult = {
  metrics: {
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
  insights: {
    seoStructure: string;
    messagingClarity: string;
    ctaUsage: string;
    contentDepth: string;
    uxConcerns: string;
  };
  recommendations: Array<{
    priority: number;
    title: string;
    reason: string;
    evidence: string[];
  }>;
  promptLogs: {
    systemPrompt: string;
    userPrompt: string;
    structuredInput: unknown;
    rawOutput: string;
  };
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze page.");
      }

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Website Audit Tool</h1>
          <p className="mt-2 text-gray-600">
            Analyze a single webpage and separate factual metrics from AI-generated insights.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium">Website URL</label>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>

        {result ? (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold">Factual Metrics</h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Word Count" value={result.metrics.wordCount} />
                <MetricCard label="H1 Count" value={result.metrics.headings.h1} />
                <MetricCard label="H2 Count" value={result.metrics.headings.h2} />
                <MetricCard label="H3 Count" value={result.metrics.headings.h3} />
                <MetricCard label="CTA Count" value={result.metrics.ctaCount} />
                <MetricCard label="Internal Links" value={result.metrics.internalLinks} />
                <MetricCard label="External Links" value={result.metrics.externalLinks} />
                <MetricCard label="Image Count" value={result.metrics.imageCount} />
                <MetricCard
                  label="Images Missing Alt %"
                  value={`${result.metrics.imagesMissingAltPercent}%`}
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoBlock
                  title="Meta Title"
                  content={result.metrics.metaTitle || "No title found"}
                />
                <InfoBlock
                  title="Meta Description"
                  content={result.metrics.metaDescription || "No meta description found"}
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold">AI Insights</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock
                  title="SEO Structure"
                  content={result.insights.seoStructure}
                />
                <InfoBlock
                  title="Messaging Clarity"
                  content={result.insights.messagingClarity}
                />
                <InfoBlock
                  title="CTA Usage"
                  content={result.insights.ctaUsage}
                />
                <InfoBlock
                  title="Content Depth"
                  content={result.insights.contentDepth}
                />
              </div>

              <div className="mt-4">
                <InfoBlock
                  title="UX / Structural Concerns"
                  content={result.insights.uxConcerns}
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold">Recommendations</h2>

              <div className="space-y-4">
                {result.recommendations.map((rec) => (
                  <div key={rec.priority} className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        Priority {rec.priority}
                      </span>
                      <h3 className="text-lg font-semibold">{rec.title}</h3>
                    </div>

                    <p className="text-sm text-gray-700">{rec.reason}</p>

                    <div className="mt-3">
                      <p className="mb-2 text-sm font-medium">Evidence</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {rec.evidence.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold">Prompt Logs</h2>

              <div className="space-y-4">
                <PromptBlock
                  title="System Prompt"
                  content={result.promptLogs.systemPrompt}
                />
                <PromptBlock
                  title="User Prompt"
                  content={result.promptLogs.userPrompt}
                />
                <PromptBlock
                  title="Structured Input"
                  content={JSON.stringify(result.promptLogs.structuredInput, null, 2)}
                />
                <PromptBlock
                  title="Raw Model Output"
                  content={result.promptLogs.rawOutput}
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

function PromptBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <pre className="overflow-x-auto rounded-xl border bg-gray-50 p-4 text-sm whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}
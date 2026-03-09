"use client";

import { useState } from "react";

type AuditResult = {
  metrics: {
    wordCount: number;
    headings: { h1: number; h2: number; h3: number };
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

const priorityColors: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "#ff4444", text: "#fff", border: "#ff4444", label: "CRITICAL" },
  2: { bg: "#ff8c00", text: "#fff", border: "#ff8c00", label: "HIGH" },
  3: { bg: "#f5c518", text: "#000", border: "#f5c518", label: "MEDIUM" },
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"metrics" | "insights" | "recommendations" | "logs">("metrics");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) { setError("Please enter a URL."); return; }
    try {
      setLoading(true); setError(""); setResult(null);
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze page.");
      setResult(data);
      setActiveTab("metrics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "metrics", label: "Metrics", count: result ? 9 : null },
    { id: "insights", label: "AI Insights", count: result ? 5 : null },
    { id: "recommendations", label: "Actions", count: result?.recommendations.length ?? null },
    { id: "logs", label: "Prompt Logs", count: null },
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", color: "#e8e6e1", fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::selection { background: #c8f04a; color: #0a0a0b; }

        .scan-input { background: transparent; border: none; border-bottom: 2px solid #3a3a42; color: #e8e6e1; font-family: inherit; font-size: 15px; outline: none; padding: 14px 0; transition: border-color 0.2s; width: 100%; }
        .scan-input:focus { border-bottom-color: #c8f04a; }
        .scan-input::placeholder { color: #666; }

        .btn-primary { align-items: center; background: #c8f04a; border: none; color: #0a0a0b; cursor: pointer; display: flex; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; gap: 8px; letter-spacing: 0.08em; padding: 14px 28px; text-transform: uppercase; transition: all 0.15s; white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { background: #d4f55e; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .tab-btn { background: none; border: none; border-bottom: 2px solid transparent; color: #888; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; padding: 12px 0; text-transform: uppercase; transition: all 0.15s; }
        .tab-btn.active { border-bottom-color: #c8f04a; color: #c8f04a; }
        .tab-btn:hover:not(.active) { color: #bbb; }

        .metric-tile { border: 1px solid #1e1e22; padding: 20px; position: relative; transition: border-color 0.2s, background 0.2s; }
        .metric-tile:hover { background: #111114; border-color: #333; }

        .insight-card { border-left: 3px solid #c8f04a; padding: 18px 20px; background: #0d0d10; margin-bottom: 2px; }
        .insight-card:hover { background: #111114; }

        .rec-card { border: 1px solid #1e1e22; padding: 20px 22px; transition: border-color 0.2s; }
        .rec-card:hover { border-color: #333; }

        .log-toggle { background: #111114; border: 1px solid #2a2a30; color: #aaa; cursor: pointer; display: flex; font-family: inherit; font-size: 12px; justify-content: space-between; letter-spacing: 0.05em; padding: 14px 18px; text-align: left; transition: all 0.15s; width: 100%; }
        .log-toggle:hover { border-color: #444; color: #e8e6e1; }
        .log-toggle.open { color: #c8f04a; border-color: #c8f04a44; }

        .spinner { animation: spin 1s linear infinite; border: 2px solid #1e1e22; border-top: 2px solid #c8f04a; border-radius: 50%; display: inline-block; height: 14px; width: 14px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .badge { align-items: center; display: inline-flex; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; padding: 3px 8px; text-transform: uppercase; }

        .pre-block { background: #070709; border: 1px solid #2a2a30; color: #b8b6b0; font-family: inherit; font-size: 12px; line-height: 1.7; overflow-x: auto; padding: 18px; white-space: pre-wrap; word-break: break-word; max-height: 320px; overflow-y: auto; }

        .section-label { color: #777; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }

        .glow-dot { background: #c8f04a; border-radius: 50%; display: inline-block; height: 6px; margin-right: 8px; width: 6px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .divider { border: none; border-top: 1px solid #1a1a1e; margin: 0; }

        .url-display { color: #888; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 480px; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1e", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="#c8f04a" strokeWidth="1.5" />
              <rect x="11" y="1" width="8" height="8" stroke="#c8f04a" strokeWidth="1.5" opacity="0.4" />
              <rect x="1" y="11" width="8" height="8" stroke="#c8f04a" strokeWidth="1.5" opacity="0.4" />
              <rect x="11" y="11" width="8" height="8" stroke="#c8f04a" strokeWidth="1.5" opacity="0.7" />
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", color: "#e8e6e1" }}>AUDIT<span style={{ color: "#c8f04a" }}>.AI</span></span>
          </div>
          <span className="section-label" style={{ color: "#888" }}>Website Intelligence Scanner</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>// run diagnostic</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.1, marginBottom: 16 }}>
            Analyze any webpage.<br /><span style={{ color: "#c8f04a" }}>Surface what matters.</span>
          </h1>
          <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, maxWidth: 480 }}>
            Factual metrics extracted from the DOM, paired with AI-generated insights — clearly separated, fully transparent.
          </p>
        </div>

        {/* Input */}
        <div style={{ background: "#0d0d10", border: "1px solid #1e1e22", padding: "24px 28px", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="section-label" style={{ display: "block", marginBottom: 10 }}>Target URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://yoursite.com/page"
                className="scan-input"
              />
            </div>
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
              {loading ? <><span className="spinner" /> Scanning...</> : <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Run Audit
              </>}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "#ff6b6b", fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="7" y1="4" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div>
            {/* Status bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="glow-dot" />
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>Audit complete</span>
                <span className="url-display">— {result.metrics.pageUrl || url}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Words", val: result.metrics.wordCount },
                  { label: "Links", val: result.metrics.internalLinks + result.metrics.externalLinks },
                  { label: "Issues", val: result.recommendations.length },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#c8f04a" }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 28, borderBottom: "1px solid #1a1a1e", marginBottom: 28 }}>
              {tabs.map(t => (
                <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id as typeof activeTab)}>
                  {t.label}
                  {t.count !== null && (
                    <span style={{ marginLeft: 6, background: activeTab === t.id ? "#c8f04a22" : "#1a1a1e", color: activeTab === t.id ? "#c8f04a" : "#444", borderRadius: 2, fontSize: 10, padding: "1px 5px", fontFamily: "'Syne', sans-serif" }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: Metrics */}
            {activeTab === "metrics" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2, marginBottom: 2 }}>
                  {[
                    { label: "Word Count", value: result.metrics.wordCount, accent: false },
                    { label: "H1 Tags", value: result.metrics.headings.h1, accent: result.metrics.headings.h1 !== 1 },
                    { label: "H2 Tags", value: result.metrics.headings.h2, accent: false },
                    { label: "H3 Tags", value: result.metrics.headings.h3, accent: false },
                    { label: "CTAs Found", value: result.metrics.ctaCount, accent: result.metrics.ctaCount === 0 },
                    { label: "Internal Links", value: result.metrics.internalLinks, accent: false },
                    { label: "External Links", value: result.metrics.externalLinks, accent: false },
                    { label: "Images", value: result.metrics.imageCount, accent: false },
                    { label: "Alt Missing", value: `${result.metrics.imagesMissingAltPercent}%`, accent: result.metrics.imagesMissingAltPercent > 20 },
                  ].map(m => (
                    <div key={m.label} className="metric-tile">
                      <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{m.label}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: m.accent ? "#ff6b6b" : "#e8e6e1" }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: 2 }}>
                  {[
                    { label: "Meta Title", value: result.metrics.metaTitle || "—", warn: !result.metrics.metaTitle },
                    { label: "Meta Description", value: result.metrics.metaDescription || "—", warn: !result.metrics.metaDescription },
                  ].map(m => (
                    <div key={m.label} className="metric-tile" style={{ gridColumn: undefined }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</span>
                        {m.warn && <span className="badge" style={{ background: "#ff444422", color: "#ff6b6b" }}>Missing</span>}
                      </div>
                      <p style={{ fontSize: 13, color: m.warn ? "#777" : "#b8b6b0", lineHeight: 1.6 }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Insights */}
            {activeTab === "insights" && (
              <div style={{ display: "grid", gap: 2 }}>
                {[
                  { key: "seoStructure", label: "SEO Structure", icon: "◈" },
                  { key: "messagingClarity", label: "Messaging Clarity", icon: "◎" },
                  { key: "ctaUsage", label: "CTA Usage", icon: "▷" },
                  { key: "contentDepth", label: "Content Depth", icon: "≡" },
                  { key: "uxConcerns", label: "UX & Structural Concerns", icon: "⚠" },
                ].map(ins => (
                  <div key={ins.key} className="insight-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ color: "#c8f04a", fontSize: 14, fontFamily: "monospace" }}>{ins.icon}</span>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em" }}>{ins.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                      {result.insights[ins.key as keyof typeof result.insights]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Recommendations */}
            {activeTab === "recommendations" && (
              <div style={{ display: "grid", gap: 2 }}>
                {result.recommendations.map((rec) => {
                  const p = priorityColors[rec.priority] ?? { bg: "#333", text: "#fff", border: "#333", label: `P${rec.priority}` };
                  return (
                    <div key={rec.priority} className="rec-card">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                          <div className="badge" style={{ background: p.bg + "22", color: p.bg, border: `1px solid ${p.bg}44`, borderRadius: 2 }}>
                            {p.label}
                          </div>
                          <span style={{ color: "#888", fontSize: 10, fontFamily: "'Syne', sans-serif" }}>#{rec.priority}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#e8e6e1" }}>{rec.title}</h3>
                          <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, marginBottom: 14 }}>{rec.reason}</p>
                          <div style={{ borderTop: "1px solid #1a1a1e", paddingTop: 12 }}>
                            <p style={{ fontSize: 10, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Evidence</p>
                            <ul style={{ listStyle: "none", display: "grid", gap: 6 }}>
                              {rec.evidence.map((item, i) => (
                                <li key={i} style={{ display: "flex", gap: 10, fontSize: 12, color: "#aaa", alignItems: "flex-start" }}>
                                  <span style={{ color: "#c8f04a", marginTop: 2, flexShrink: 0 }}>›</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Logs */}
            {activeTab === "logs" && (
              <div style={{ display: "grid", gap: 2 }}>
                {[
                  { key: "system", label: "SYSTEM PROMPT", content: result.promptLogs.systemPrompt },
                  { key: "user", label: "USER PROMPT", content: result.promptLogs.userPrompt },
                  { key: "input", label: "STRUCTURED INPUT", content: JSON.stringify(result.promptLogs.structuredInput, null, 2) },
                  { key: "output", label: "RAW MODEL OUTPUT", content: result.promptLogs.rawOutput },
                ].map(log => (
                  <div key={log.key}>
                    <button className={`log-toggle${expandedLog === log.key ? " open" : ""}`} onClick={() => setExpandedLog(expandedLog === log.key ? null : log.key)}>
                      <span>{log.label}</span>
                      <span style={{ fontFamily: "monospace" }}>{expandedLog === log.key ? "[ collapse ]" : "[ expand ]"}</span>
                    </button>
                    {expandedLog === log.key && (
                      <pre className="pre-block">{log.content}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ border: "1px dashed #2a2a30", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 16 }}>Awaiting target URL</div>
            <div style={{ color: "#444", fontSize: 48, marginBottom: 16 }}>⬡</div>
            <p style={{ color: "#777", fontSize: 13, maxWidth: 320, margin: "0 auto", lineHeight: 1.7 }}>
              Enter a URL above and run the audit to see factual metrics, AI insights, and actionable recommendations.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ border: "1px solid #1e1e22", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "#c8f04a", fontFamily: "'Syne', sans-serif", fontSize: 13, letterSpacing: "0.1em" }}>
              <span className="spinner" />
              Scanning page...
            </div>
            <p style={{ color: "#777", fontSize: 12, marginTop: 12 }}>Extracting DOM metrics and running AI analysis</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #111", padding: "20px 32px", marginTop: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: 11, letterSpacing: "0.1em", fontFamily: "'Syne', sans-serif" }}>AUDIT.AI — Website Intelligence</span>
          <span style={{ color: "#555", fontSize: 11 }}>© {new Date().getFullYear()} Himash Rajapaksha. All Rights Reserved.</span>
        </div>
      </footer>
    </main>
  );
}
import * as cheerio from "cheerio";
import { AuditMetrics } from "@/types/audit";

function countWords(text: string): number {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function isInternalLink(href: string, hostname: string): boolean {
  if (!href) return false;
  if (href.startsWith("/")) return true;
  if (href.startsWith("#")) return true;

  try {
    const url = new URL(href);
    return url.hostname === hostname;
  } catch {
    return false;
  }
}

function isExternalLink(href: string, hostname: string): boolean {
  if (!href) return false;

  try {
    const url = new URL(href);
    return url.hostname !== hostname;
  } catch {
    return false;
  }
}

function isLikelyCTA(text: string): boolean {
  const ctaWords = [
    "contact",
    "book",
    "schedule",
    "get started",
    "start",
    "request demo",
    "demo",
    "sign up",
    "try now",
    "buy now",
    "learn more",
    "talk to sales",
  ];

  const lower = text.toLowerCase();
  return ctaWords.some((word) => lower.includes(word));
}

export function extractMetrics(html: string, pageUrl: string): AuditMetrics {
  const $ = cheerio.load(html);
  const hostname = new URL(pageUrl).hostname;

  $("script, style, noscript").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = countWords(bodyText);

  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;

  let ctaCount = 0;
  $("a, button").each((_, el) => {
    const text = $(el).text().trim();
    if (text && isLikelyCTA(text)) ctaCount++;
  });

  let internalLinks = 0;
  let externalLinks = 0;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (isInternalLink(href, hostname)) internalLinks++;
    else if (isExternalLink(href, hostname)) externalLinks++;
  });

  const imageCount = $("img").length;
  let missingAlt = 0;

  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (!alt || alt.trim() === "") missingAlt++;
  });

  const imagesMissingAltPercent =
    imageCount === 0 ? 0 : Number(((missingAlt / imageCount) * 100).toFixed(1));

  const metaTitle = $("title").text().trim() || "";
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || "";

  return {
    wordCount,
    headings: { h1, h2, h3 },
    ctaCount,
    internalLinks,
    externalLinks,
    imageCount,
    imagesMissingAltPercent,
    metaTitle,
    metaDescription,
    pageText: bodyText.slice(0, 6000),
    pageUrl,
  };
}
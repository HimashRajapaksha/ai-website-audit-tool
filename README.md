# AI Website Audit Tool

A lightweight AI-powered website audit tool built for the Eight25 AI-Native Software Engineer assessment.

The tool accepts a single URL, extracts factual webpage metrics, and uses an LLM to generate structured insights and prioritized recommendations. Factual metrics are intentionally kept separate from AI-generated analysis.

## Features

### Factual Metrics
- Total word count
- Heading counts (H1, H2, H3)
- CTA count
- Internal vs external link count
- Image count
- Percentage of images missing alt text
- Meta title
- Meta description

### AI Insights
- SEO structure
- Messaging clarity
- CTA usage
- Content depth
- UX / structural concerns

### Recommendations
- 3–5 prioritized recommendations
- Each recommendation is grounded in extracted metrics and page content

### Prompt Logs
- System prompt
- User prompt
- Structured input sent to the model
- Raw model output before formatting

## Architecture Overview

The app is split into two clear layers:

1. **Deterministic extraction layer**
   - Fetches a single webpage
   - Parses HTML
   - Extracts factual metrics

2. **AI analysis layer**
   - Receives structured inputs from the extraction layer
   - Generates grounded insights and recommendations
   - Returns structured JSON output
   - Exposes prompt logs for transparency

## Tech Stack

- **Next.js** for frontend and API routes
- **TypeScript** for type safety
- **Cheerio** for HTML parsing
- **Google Gemini API** for AI analysis
- **Vercel** for deployment

## Project Structure

```text
app/
  api/
    audit/
      route.ts
  page.tsx

lib/
  fetchHtml.ts
  extractMetrics.ts
  buildPrompt.ts
  aiAnalysis.ts

types/
  audit.ts
/**
 * API client — all data fetching functions used by the frontend.
 * The frontend NEVER processes, aggregates, or computes data. It only
 * passes date parameters to the backend, which delegates to Databricks SQL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Types returned by each endpoint
// ---------------------------------------------------------------------------

export interface EwiSummaryRow {
  entity_id: string;
  entity_name: string;
  industry: string;
  exposure_usd: number;
  risk_score: number;
  risk_tier: 'High' | 'Medium' | 'Low';
  last_review_date: string;
  status: string;
  avg_sentiment_score: number;
  dominant_sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface SentimentTimeseriesRow {
  date: string;
  avg_sentiment_score: number;
  article_count: number;
}

export interface SentimentDistributionRow {
  week_start: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface NewsArticleRow {
  article_id: string;
  headline: string;
  source: string;
  published_at: string;
  sentiment_label: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score: number;
  url: string;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error [${res.status}]: ${error}`);
  }
  const json = await res.json();
  return json.data as T;
}

function dateParams({ startDate, endDate }: DateRange): URLSearchParams {
  const p = new URLSearchParams();
  p.set('start_date', startDate);
  p.set('end_date', endDate);
  return p;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function fetchEwiSummary(dates: DateRange): Promise<EwiSummaryRow[]> {
  return apiFetch<EwiSummaryRow[]>(
    `/api/ewi/summary?${dateParams(dates).toString()}`,
  );
}

export async function fetchSentimentTimeseries(
  entityId: string,
  dates: DateRange,
): Promise<SentimentTimeseriesRow[]> {
  const p = dateParams(dates);
  return apiFetch<SentimentTimeseriesRow[]>(
    `/api/sentiment/timeseries/${encodeURIComponent(entityId)}?${p.toString()}`,
  );
}

export async function fetchSentimentDistribution(
  entityId: string,
  dates: DateRange,
): Promise<SentimentDistributionRow[]> {
  const p = dateParams(dates);
  return apiFetch<SentimentDistributionRow[]>(
    `/api/sentiment/distribution/${encodeURIComponent(entityId)}?${p.toString()}`,
  );
}

export async function fetchRecentNews(
  entityId: string,
  dates: DateRange,
): Promise<NewsArticleRow[]> {
  const p = dateParams(dates);
  return apiFetch<NewsArticleRow[]>(
    `/api/sentiment/news/${encodeURIComponent(entityId)}?${p.toString()}`,
  );
}

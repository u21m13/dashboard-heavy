'use client';

import Link from 'next/link';
import { ArrowRight, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EwiSummaryRow } from '@/lib/api';

interface Props {
  row: EwiSummaryRow;
  dateRange: { startDate: string; endDate: string };
}

const RISK_COLORS: Record<string, string> = {
  High: 'text-risk-high border-risk-high/30 bg-risk-high/5',
  Medium: 'text-risk-medium border-risk-medium/30 bg-risk-medium/5',
  Low: 'text-risk-low border-risk-low/30 bg-risk-low/5',
};

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: 'text-positive bg-positive/10',
  Neutral: 'text-neutral bg-neutral/10',
  Negative: 'text-negative bg-negative/10',
};

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === 'Positive') return <TrendingUp size={12} />;
  if (sentiment === 'Negative') return <TrendingDown size={12} />;
  return <Minus size={12} />;
}

function formatExposure(usd: number): string {
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  return `$${usd.toLocaleString()}`;
}

export default function CounterpartyCard({ row, dateRange }: Props) {
  const riskClass = RISK_COLORS[row.risk_tier] ?? 'text-text-secondary';
  const sentimentClass = SENTIMENT_COLORS[row.dominant_sentiment] ?? 'text-text-secondary';

  const params = new URLSearchParams({
    start_date: dateRange.startDate,
    end_date: dateRange.endDate,
  });

  return (
    <article className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/5 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-accent-blue" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate">
              {row.entity_name}
            </p>
            <p className="text-[11px] text-text-secondary">{row.industry}</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-md border uppercase tracking-wide flex-shrink-0 ${riskClass}`}
        >
          {row.risk_tier}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Metric label="Exposure" value={formatExposure(row.exposure_usd)} />
        <Metric label="Risk Score" value={row.risk_score.toFixed(2)} />
        <Metric label="Status" value={row.status} />
        <Metric
          label="Last Review"
          value={row.last_review_date ? new Date(row.last_review_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
        />
      </div>

      {/* Sentiment row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <span className="text-[11px] text-text-secondary">Sentiment</span>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sentimentClass}`}
        >
          <SentimentIcon sentiment={row.dominant_sentiment} />
          {row.dominant_sentiment}
        </span>
        <span className="ml-auto text-[11px] text-text-secondary font-mono">
          {row.avg_sentiment_score.toFixed(3)}
        </span>
      </div>

      {/* Details link */}
      <Link
        href={`/sentiment/${encodeURIComponent(row.entity_id)}?${params.toString()}&name=${encodeURIComponent(row.entity_name)}`}
        className="flex items-center gap-1.5 text-xs text-accent-blue font-medium mt-auto group-hover:gap-2.5 transition-all duration-200"
      >
        Details
        <ArrowRight size={13} />
      </Link>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-2 rounded-lg px-3 py-2">
      <p className="text-[10px] text-text-secondary mb-0.5">{label}</p>
      <p className="text-xs font-medium text-text-primary truncate">{value}</p>
    </div>
  );
}

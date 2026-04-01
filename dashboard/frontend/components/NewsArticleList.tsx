'use client';

import { ExternalLink, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { NewsArticleRow } from '@/lib/api';

interface Props {
  articles: NewsArticleRow[];
}

const SENTIMENT_STYLES: Record<string, string> = {
  Positive: 'text-positive bg-positive/10',
  Neutral: 'text-neutral bg-neutral/10',
  Negative: 'text-negative bg-negative/10',
};

function SentimentIcon({ label }: { label: string }) {
  if (label === 'Positive') return <TrendingUp size={11} />;
  if (label === 'Negative') return <TrendingDown size={11} />;
  return <Minus size={11} />;
}

export default function NewsArticleList({ articles }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-1">
        Recent News Articles
      </h2>
      <p className="text-xs text-text-secondary mb-5">
        Latest {articles.length} article{articles.length !== 1 ? 's' : ''} — ordered by Databricks SQL
      </p>

      {articles.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-8">
          No articles found for selected date range.
        </p>
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li
              key={article.article_id}
              className="flex flex-col gap-2 bg-surface-2 rounded-lg p-4 border border-border hover:border-accent-blue/30 transition-colors"
            >
              <div className="flex items-start gap-3 justify-between">
                <p className="text-sm text-text-primary font-medium leading-snug flex-1">
                  {article.headline}
                </p>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:text-white transition-colors flex-shrink-0 mt-0.5"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] text-text-secondary">
                  {article.source}
                </span>
                <span className="text-[11px] text-text-secondary">·</span>
                <span className="text-[11px] text-text-secondary">
                  {new Date(article.published_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      SENTIMENT_STYLES[article.sentiment_label] ?? 'text-text-secondary'
                    }`}
                  >
                    <SentimentIcon label={article.sentiment_label} />
                    {article.sentiment_label}
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    {article.sentiment_score.toFixed(3)}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

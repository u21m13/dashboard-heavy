'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SentimentTimeline from '@/components/SentimentTimeline';
import SentimentDistribution from '@/components/SentimentDistribution';
import NewsArticleList from '@/components/NewsArticleList';
import {
  fetchSentimentTimeseries,
  fetchSentimentDistribution,
  fetchRecentNews,
  type SentimentTimeseriesRow,
  type SentimentDistributionRow,
  type NewsArticleRow,
} from '@/lib/api';
import { ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function today() {
  return new Date().toISOString().split('T')[0];
}

function ninetyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split('T')[0];
}

interface SentimentPageProps {
  params: { id: string };
}

export default function SentimentPage({ params }: SentimentPageProps) {
  const searchParams = useSearchParams();
  const entityId = decodeURIComponent(params.id);
  const entityName = searchParams.get('name') ?? entityId;

  const [startDate, setStartDate] = useState(
    searchParams.get('start_date') ?? ninetyDaysAgo(),
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('end_date') ?? today(),
  );

  const [timeseries, setTimeseries] = useState<SentimentTimeseriesRow[]>([]);
  const [distribution, setDistribution] = useState<SentimentDistributionRow[]>([]);
  const [articles, setArticles] = useState<NewsArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const dates = { startDate, endDate };
        const [ts, dist, news] = await Promise.all([
          fetchSentimentTimeseries(entityId, dates),
          fetchSentimentDistribution(entityId, dates),
          fetchRecentNews(entityId, dates),
        ]);
        setTimeseries(ts);
        setDistribution(dist);
        setArticles(news);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load sentiment data.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [entityId, startDate, endDate]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <main className="flex-1 ml-64 p-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={13} />
            EWI Dashboard
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{entityName}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Sentiment Analysis
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {entityName} &mdash; data from Databricks&nbsp;
            <span className="font-medium text-text-primary">{startDate}</span>
            &nbsp;to&nbsp;
            <span className="font-medium text-text-primary">{endDate}</span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-negative/10 border border-negative/30 rounded-xl px-4 py-3 text-sm text-negative">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-text-secondary">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Querying Databricks…</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SentimentTimeline data={timeseries} />
              <SentimentDistribution data={distribution} />
            </div>

            {/* News articles */}
            <NewsArticleList articles={articles} />
          </div>
        )}
      </main>
    </div>
  );
}

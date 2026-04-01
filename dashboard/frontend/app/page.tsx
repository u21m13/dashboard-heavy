'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import CounterpartyCard from '@/components/CounterpartyCard';
import { fetchEwiSummary, type EwiSummaryRow } from '@/lib/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

function today() {
  return new Date().toISOString().split('T')[0];
}

function ninetyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().split('T')[0];
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-3/4" />
          <div className="skeleton h-2.5 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-lg" />
        ))}
      </div>
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

export default function EwiDashboard() {
  const [startDate, setStartDate] = useState(ninetyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [rows, setRows] = useState<EwiSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEwiSummary({ startDate, endDate });
      setRows(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch data from Databricks.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Re-fetch whenever dates change (debounce via useEffect)
  useEffect(() => {
    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              EWI Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Counterparty Risk Monitor &mdash; live from Databricks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <p className="text-xs text-text-secondary">
                {rows.length} counterpart{rows.length !== 1 ? 'ies' : 'y'} found
              </p>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border text-xs text-text-secondary rounded-lg hover:text-text-primary hover:border-accent-blue/50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Date range info banner */}
        <div className="mb-6 px-4 py-2.5 bg-surface border border-border rounded-lg flex items-center gap-2 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          Showing data from&nbsp;
          <span className="text-text-primary font-medium">{startDate}</span>
          &nbsp;to&nbsp;
          <span className="text-text-primary font-medium">{endDate}</span>
          &nbsp;— all aggregations computed by Databricks SQL
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-negative/10 border border-negative/30 rounded-xl px-4 py-3 text-sm text-negative">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : rows.map((row) => (
                <CounterpartyCard
                  key={row.entity_id}
                  row={row}
                  dateRange={{ startDate, endDate }}
                />
              ))}
        </div>

        {!loading && rows.length === 0 && !error && (
          <div className="text-center py-20 text-text-secondary">
            <p className="text-lg font-medium mb-1">No counterparties found</p>
            <p className="text-sm">Try adjusting the date range in the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}

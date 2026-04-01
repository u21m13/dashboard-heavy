'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SentimentTimeseriesRow } from '@/lib/api';

interface Props {
  data: SentimentTimeseriesRow[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-secondary mb-1">{label}</p>
      <p className="text-text-primary font-semibold">
        Score:{' '}
        <span className={payload[0].value >= 0 ? 'text-positive' : 'text-negative'}>
          {payload[0].value.toFixed(4)}
        </span>
      </p>
      <p className="text-text-secondary">
        Articles: {payload[0]?.payload?.article_count ?? '—'}
      </p>
    </div>
  );
}

export default function SentimentTimeline({ data }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-1">
        Sentiment Over Time
      </h2>
      <p className="text-xs text-text-secondary mb-5">
        Daily average sentiment score — computed by Databricks SQL
      </p>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-text-secondary text-sm">
          No data available for selected date range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
              }
              tick={{ fontSize: 11, fill: '#8b949e' }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#8b949e' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#30363d" strokeDasharray="4 2" />
            <Line
              type="monotone"
              dataKey="avg_sentiment_score"
              stroke="#1f6feb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#1f6feb', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

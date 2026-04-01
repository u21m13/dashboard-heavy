'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SentimentDistributionRow } from '@/lib/api';

interface Props {
  data: SentimentDistributionRow[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-secondary mb-2">
        Week of {new Date(label).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function SentimentDistribution({ data }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-1">
        Sentiment Distribution
      </h2>
      <p className="text-xs text-text-secondary mb-5">
        Weekly article counts (Positive / Neutral / Negative) — grouped by Databricks SQL
      </p>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-text-secondary text-sm">
          No data available for selected date range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis
              dataKey="week_start"
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
              }
              tick={{ fontSize: 11, fill: '#8b949e' }}
              axisLine={{ stroke: '#30363d' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8b949e' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#8b949e', paddingTop: 12 }}
            />
            <Bar dataKey="positive" name="Positive" fill="#3fb950" radius={[3, 3, 0, 0]} />
            <Bar dataKey="neutral" name="Neutral" fill="#e3b341" radius={[3, 3, 0, 0]} />
            <Bar dataKey="negative" name="Negative" fill="#f85149" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

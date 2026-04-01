'use client';

import { CalendarDays, BarChart3, Activity, Home } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

export default function Sidebar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-20">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-tight">EWI Monitor</p>
            <p className="text-[10px] text-text-secondary">Risk Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary px-2 mb-2">
          Views
        </p>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-primary bg-surface-2 hover:bg-surface-2 transition-colors mb-1"
        >
          <Home size={15} className="text-accent-blue" />
          EWI Dashboard
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <BarChart3 size={15} />
          Sentiment Analysis
        </Link>
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-border my-3" />

      {/* Date Filter */}
      <div className="px-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={14} className="text-accent-blue" />
          <p className="text-xs font-semibold text-text-primary">Date Filter</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-text-secondary mb-1.5 font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-surface-2 border border-border text-text-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-secondary mb-1.5 font-medium">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full bg-surface-2 border border-border text-text-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-border">
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Adjusting dates triggers a live query to Databricks. All aggregations
            are computed on the warehouse.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-[10px] text-text-secondary">
          Powered by Databricks SQL
        </p>
      </div>
    </aside>
  );
}

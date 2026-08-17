"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Eye,
  BookOpen,
  MousePointer,
  DollarSign,
  BarChart3,
  Calendar,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsConsoleProps {
  initialPerformance: any;
}

export function AnalyticsConsole({ initialPerformance }: AnalyticsConsoleProps) {
  const [performance, setPerformance] = useState(initialPerformance);
  const [days, setDays] = useState(14);
  const [isLoading, setIsLoading] = useState(false);

  const formatMYR = (minor: number) => {
    return `RM ${(minor / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totals = performance?.totals || {
    totalPageViews: 0,
    totalReads: 0,
    totalAdImpressions: 0,
    totalAdClicks: 0,
    totalEstimatedRevenueMinor: 0,
    overallCtrPercent: 0,
    overallRpmMinor: 0,
    revenueStatus: "ESTIMATED",
  };

  const daily = performance?.daily || [];

  const handleRangeChange = async (newDays: number) => {
    setDays(newDays);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/overview?days=${newDays}`);
      const data = await res.json();
      if (data.totals) setPerformance(data);
    } catch {}
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Date Range:</span>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => handleRangeChange(d)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                days === d
                  ? "bg-brand-green text-slate-950"
                  : "bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750"
              )}
            >
              Last {d} Days
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-pitch-900 border border-pitch-800 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
          <span>Privacy-Preserving Telemetry (Zero Unhashed PII)</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pageviews</span>
            <Eye className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 mt-2">
            {totals.totalPageViews.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Aggregated traffic</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Article Reads</span>
            <BookOpen className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 mt-2">
            {totals.totalReads.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">≥ 15s dwell sessions</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Ad Impressions</span>
            <Zap className="w-4 h-4 text-pitch-gold" />
          </div>
          <div className="text-xl font-extrabold text-pitch-gold mt-2">
            {totals.totalAdImpressions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rendered slots</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Ad Clicks</span>
            <MousePointer className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400 mt-2">
            {totals.totalAdClicks.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">CTR: {totals.overallCtrPercent}%</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Estimated Yield</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-2">
            {formatMYR(totals.totalEstimatedRevenueMinor)}
          </div>
          <span className="text-[10px] text-emerald-500 mt-1 block uppercase font-mono font-bold">
            [{totals.revenueStatus}]
          </span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Effective RPM</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-purple-400 mt-2">
            {formatMYR(totals.overallRpmMinor)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Yield per 1k views</span>
        </div>
      </div>

      {/* Daily Performance Table */}
      <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
            <tr>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Pageviews</th>
              <th className="p-3.5 text-right">Article Reads</th>
              <th className="p-3.5 text-right">Ad Impressions</th>
              <th className="p-3.5 text-right">Ad Clicks</th>
              <th className="p-3.5 text-right">CTR</th>
              <th className="p-3.5 text-right">Estimated Revenue</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-800/60">
            {daily.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  No aggregated analytics recorded for this period.
                </td>
              </tr>
            ) : (
              daily.map((d: any) => (
                <tr key={d.date} className="hover:bg-pitch-850/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-200">{d.date}</td>
                  <td className="p-3.5 text-right font-bold text-slate-100">
                    {d.pageViews.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-300">
                    {d.articleReads.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-pitch-gold">
                    {d.adImpressions.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-blue-400">
                    {d.adClicks.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-300">{d.ctrPercent}%</td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">
                    {formatMYR(d.estimatedRevenueMinor)}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pitch-800 text-slate-400 font-mono">
                      {d.revenueStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

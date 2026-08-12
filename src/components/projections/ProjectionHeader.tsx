'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ProjectionHeaderProps {
  title: string;
  subtitle: string;
  badgeLabel: string;
  icon: React.ReactNode;
}

export const ProjectionHeader: React.FC<ProjectionHeaderProps> = ({
  title,
  subtitle,
  badgeLabel,
  icon,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900 border-b border-indigo-500/20 p-4 sm:p-5 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Back Link & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-border-subtle hover:bg-slate-800 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Keluar dari Proyeksi"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Lensa Proyeksi Analitis
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {badgeLabel}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white flex items-center gap-2 mt-1 truncate">
              {icon}
              <span className="truncate">{title}</span>
            </h1>
            <p className="text-xs text-indigo-200/80 truncate mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Right: Exit Affordance Button Link */}
        <Link
          href="/dashboard"
          aria-label="Keluar Lensa Proyeksi"
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Keluar Lensa Proyeksi</span>
        </Link>
      </div>
    </div>
  );
};

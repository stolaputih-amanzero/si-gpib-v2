'use client';

import React from 'react';
import { PastoralAssignmentItemViewModel } from '@/types/pastoralTransferViewModel.types';
import { Building2, Calendar, Clock } from 'lucide-react';

interface AssignmentHistoryTimelineProps {
  assignments: PastoralAssignmentItemViewModel[];
}

export const AssignmentHistoryTimeline: React.FC<AssignmentHistoryTimelineProps> = ({ assignments }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Timelines & Continuity Histori Pelayanan</h2>
        <p className="text-xs text-slate-500">Jejak histori penugasan pastoral yang diarsipkan imutabel</p>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pt-2">
        {assignments.map((assignment) => {
          const isActive = assignment.status_penugasan === 'ACTIVE';

          return (
            <div key={assignment.id_penugasan} className="relative pl-6 space-y-2">
              {/* Timeline Bullet Dot */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                  isActive
                    ? 'border-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/50'
                    : 'border-slate-400'
                }`}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{assignment.nama_organisasi}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{assignment.jabatan}</div>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${assignment.statusBadgeColor}`}>
                  {assignment.statusLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{assignment.startDateFormatted} — {assignment.endDateFormatted}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Durasi: {assignment.durationFormatted}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

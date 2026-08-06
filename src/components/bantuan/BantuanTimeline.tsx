'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { StatusBantuan } from '@/lib/domains/bantuan/bantuan.types';

interface TimelineStep {
  status: StatusBantuan;
  label: string;
  timestamp: string | null;
  catatan?: string | null;
  actor?: string | null;
}

interface BantuanTimelineProps {
  steps: TimelineStep[];
  currentStatus: StatusBantuan;
  className?: string;
}

const statusOrder: StatusBantuan[] = [
  'Draft',
  'Pending_KMJ',
  'Pending_Mupel',
  'Pending_Sinode',
  'Approved', // Atau Rejected di akhir
];

export function BantuanTimeline({ steps, currentStatus, className }: BantuanTimelineProps) {
  const isRejected = currentStatus === 'Rejected';
  
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCurrent = step.status === currentStatus;
        const isPast = statusOrder.indexOf(step.status) < statusOrder.indexOf(currentStatus) && !isRejected;
        const isRejectedStep = isRejected && isLast;
        
        let Icon = Circle;
        let iconColor = 'text-gray-300 bg-white border-2 border-gray-300';
        let lineColor = 'bg-gray-200';
        let titleColor = 'text-gray-500';

        if (isPast || (isCurrent && !isRejectedStep)) {
          Icon = CheckCircle2;
          iconColor = 'text-white bg-green-500 border-2 border-green-500';
          lineColor = 'bg-green-500';
          titleColor = 'text-gray-900';
        } 
        
        if (isCurrent && !isRejectedStep) {
          Icon = Clock;
          iconColor = 'text-white bg-blue-500 border-2 border-blue-500 ring-4 ring-blue-100';
          titleColor = 'text-blue-700 font-semibold';
        }

        if (isRejectedStep) {
          Icon = XCircle;
          iconColor = 'text-white bg-red-500 border-2 border-red-500 ring-4 ring-red-100';
          titleColor = 'text-red-700 font-semibold';
          lineColor = 'bg-red-500'; // Garis penghubung ke node reject juga merah
        }

        return (
          <div key={step.status} className="flex gap-4">
            {/* Icon & Line */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 my-1', isRejectedStep ? 'bg-red-200' : lineColor)} />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
              <h4 className={cn('text-sm font-medium', titleColor)}>
                {step.label}
              </h4>
              {step.timestamp && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(step.timestamp), 'd MMM yyyy, HH:mm', { locale: id })}
                  {step.actor && ` • ${step.actor}`}
                </p>
              )}
              {step.catatan && (
                <div className={cn(
                  "mt-2 p-2.5 border rounded-lg text-xs italic",
                  isRejectedStep ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-700"
                )}>
                  "{step.catatan}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

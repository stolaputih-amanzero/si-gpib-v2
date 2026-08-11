import React from 'react';
import { Lock, ShieldAlert, EyeOff } from 'lucide-react';
import { PrivacyReason } from '../../types/person.types';

interface PrivacyStateNoticeProps {
  reason: PrivacyReason;
  label: string;
  compact?: boolean;
}

export const PrivacyStateNotice: React.FC<PrivacyStateNoticeProps> = ({
  reason,
  label,
  compact = false
}) => {
  const getIcon = () => {
    switch (reason) {
      case 'OUTSIDE_CONTEXT':
        return <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'INSUFFICIENT_PERMISSION':
        return <Lock className="w-4 h-4 text-slate-400 shrink-0" />;
      case 'SELF_ONLY':
      case 'PRIVATE_SCOPE':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Lock className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        {getIcon()}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm">
      {getIcon()}
      <div className="space-y-0.5">
        <p className="font-medium text-slate-700 dark:text-slate-300">Akses Dibatasi</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
};

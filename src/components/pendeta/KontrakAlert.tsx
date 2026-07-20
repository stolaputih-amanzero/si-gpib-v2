import { differenceInDays, isBefore, startOfDay } from 'date-fns';
import { AlertCircle, Clock, XCircle } from 'lucide-react';

interface KontrakAlertProps {
  tglAkhir: string;
}

export function KontrakAlert({ tglAkhir }: KontrakAlertProps) {
  const endDate = startOfDay(new Date(tglAkhir));
  const today = startOfDay(new Date());
  
  const isExpired = isBefore(endDate, today);
  const daysLeft = differenceInDays(endDate, today);
  
  if (daysLeft > 90 && !isExpired) return null;
  
  const urgency = isExpired 
    ? 'expired' 
    : daysLeft <= 30 
      ? 'error' 
      : daysLeft <= 60 
        ? 'warning' 
        : 'info';
  
  const config = {
    expired: {
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      icon: <XCircle className="w-3 h-3" />,
      text: 'Kontrak Kedaluwarsa'
    },
    error: {
      color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      icon: <AlertCircle className="w-3 h-3" />,
      text: `Sisa ${daysLeft} hari`
    },
    warning: {
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      icon: <AlertCircle className="w-3 h-3" />,
      text: `Sisa ${daysLeft} hari`
    },
    info: {
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      icon: <Clock className="w-3 h-3" />,
      text: `Sisa ${daysLeft} hari`
    }
  };
  
  const { color, icon, text } = config[urgency];
  
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${color}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

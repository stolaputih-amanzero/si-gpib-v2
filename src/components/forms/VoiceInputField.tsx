'use client';

import { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '@/hooks/use-voice-input';
import { cn } from '@/lib/utils';

export interface VoiceInputFieldProps {
  onTranscribe: (text: string) => void;
  className?: string;
}

export function VoiceInputField({ onTranscribe, className }: VoiceInputFieldProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      onTranscribe(transcript);
    }
  }, [transcript, onTranscribe]);

  if (!isSupported) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-xs text-text-tertiary', className)}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-10 h-10 rounded-full bg-surface-sunken text-text-tertiary flex items-center justify-center cursor-not-allowed border border-border-subtle shrink-0"
          title="Voice input tidak didukung di browser ini. Gunakan keyboard."
        >
          <MicOff size={16} />
        </button>
        <span className="text-[11px] text-text-tertiary hidden sm:inline">Gunakan keyboard</span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all active:scale-95 shadow-2xs border shrink-0 cursor-pointer min-h-[44px] min-w-[44px]',
          isListening
            ? 'bg-red-600 text-white border-red-500 animate-pulse'
            : 'bg-brand-primary text-white border-brand-primary/40 hover:bg-brand-primary/90'
        )}
        title={isListening ? 'Hentikan Rekaman Suara' : 'Mulai Input Suara'}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      {isListening && (
        <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
          <span>Mendengarkan...</span>
        </span>
      )}
    </div>
  );
}

export default VoiceInputField;

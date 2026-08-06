'use client';
import { usePosContext } from '@/stores/pos-context';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown } from 'lucide-react';
import { QuickPosSheet } from './QuickPosSheet';
import { useState } from 'react';

export function ContextChip() {
  const { activePosId } = usePosContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        size="sm" 
        className="rounded-full h-8 px-3 text-xs bg-muted/50 hover:bg-muted font-medium"
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="w-3 h-3 mr-1.5 text-primary" />
        <span className="truncate max-w-[120px]">{activePosId || 'Pilih Pos'}</span>
        <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
      </Button>

      <QuickPosSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

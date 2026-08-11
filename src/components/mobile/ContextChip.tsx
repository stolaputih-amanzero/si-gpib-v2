'use client';
import { useActiveContext } from '@/stores/active-context';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown } from 'lucide-react';
import { ContextSwitcherSheet } from './ContextSwitcherSheet';
import { useState } from 'react';

export function ContextChip() {
  const { activeContextId } = useActiveContext();
  const [isOpen, setIsOpen] = useState(false);

  // Derive a simple label from ID if possible. Note: In a real app, 
  // you'd look up the name or keep it in context state, 
  // but for now we'll just show the ID or fallback.
  const displayLabel = activeContextId || 'Pilih Konteks';

  return (
    <>
      <Button 
        variant="secondary" 
        size="sm" 
        className="rounded-full h-8 px-3 text-xs bg-muted/50 hover:bg-muted font-medium"
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="w-3 h-3 mr-1.5 text-primary" />
        <span className="truncate max-w-[120px]">{displayLabel}</span>
        <ChevronDown className="w-3 h-3 ml-1.5 opacity-50" />
      </Button>

      <ContextSwitcherSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

// src/stores/pos-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PosContextType {
  activePosId: string | null;
  setActivePosId: (id: string) => void;
  isLoading: boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const STORAGE_KEY = 'sigpib:active-pos';

export function PosProvider({ children }: { children: ReactNode }) {
  const [activePosId, setActivePosIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActivePosIdState(saved);
    }
    setIsLoading(false);
  }, []);

  const setActivePosId = (id: string) => {
    setActivePosIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <PosContext.Provider value={{ activePosId, setActivePosId, isLoading }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePosContext() {
  const context = useContext(PosContext);
  if (context === undefined) {
    throw new Error('usePosContext must be used within a PosProvider');
  }
  return context;
}

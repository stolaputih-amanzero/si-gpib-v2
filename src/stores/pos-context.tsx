'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { setWorkingContext } from '@/app/actions/context';

interface PosContextType {
  activePosId: string | null;
  setActivePosId: (id: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children, initialContextId = null }: { children: ReactNode, initialContextId?: string | null }) {
  const [activePosId, setActivePosIdState] = useState<string | null>(initialContextId);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // If server context changes (e.g. navigation), sync it to client state
  useEffect(() => {
    setActivePosIdState(initialContextId);
  }, [initialContextId]);

  const setActivePosId = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await setWorkingContext(id);
      if (result.success) {
        startTransition(() => {
          setActivePosIdState(id);
        });
      }
    } catch (error) {
      console.error('Failed to set working context', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PosContext.Provider value={{ activePosId, setActivePosId, isLoading, isPending }}>
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

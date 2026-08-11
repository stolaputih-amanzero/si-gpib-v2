'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { setWorkingContext } from '@/app/actions/context';

interface ActiveContextType {
  activeContextId: string | null;
  setActiveContextId: (id: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export function ActiveContextProvider({ children, initialContextId = null }: { children: ReactNode, initialContextId?: string | null }) {
  const [activeContextId, setActiveContextIdState] = useState<string | null>(initialContextId);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // If server context changes (e.g. navigation), sync it to client state
  useEffect(() => {
    setActiveContextIdState(initialContextId);
  }, [initialContextId]);

  const setActiveContextId = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await setWorkingContext(id);
      if (result.success) {
        startTransition(() => {
          setActiveContextIdState(id);
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
    <ActiveContext.Provider value={{ activeContextId, setActiveContextId, isLoading, isPending }}>
      {children}
    </ActiveContext.Provider>
  );
}

export function useActiveContext() {
  const context = useContext(ActiveContext);
  if (context === undefined) {
    throw new Error('useActiveContext must be used within an ActiveContextProvider');
  }
  return context;
}

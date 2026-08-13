import { create } from 'zustand';

interface ContextUIState {
  isSwitcherOpen: boolean;
  isSwitching: boolean;
  optimisticContextId: string | null;
  isQuickActionOpen: boolean;
  setSwitcherOpen: (isOpen: boolean) => void;
  setSwitching: (isSwitching: boolean) => void;
  setOptimisticContextId: (id: string | null) => void;
  setQuickActionOpen: (isOpen: boolean) => void;
}

export const useContextUIStore = create<ContextUIState>((set) => ({
  isSwitcherOpen: false,
  isSwitching: false,
  optimisticContextId: null,
  isQuickActionOpen: false,
  setSwitcherOpen: (isOpen) => set({ isSwitcherOpen: isOpen }),
  setSwitching: (isSwitching) => set({ isSwitching }),
  setOptimisticContextId: (id) => set({ optimisticContextId: id }),
  setQuickActionOpen: (isOpen) => set({ isQuickActionOpen: isOpen }),
}));

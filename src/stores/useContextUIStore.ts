import { create } from 'zustand';

interface ContextUIState {
  isSwitcherOpen: boolean;
  isSwitching: boolean;
  optimisticContextId: string | null;
  setSwitcherOpen: (isOpen: boolean) => void;
  setSwitching: (isSwitching: boolean) => void;
  setOptimisticContextId: (id: string | null) => void;
}

export const useContextUIStore = create<ContextUIState>((set) => ({
  isSwitcherOpen: false,
  isSwitching: false,
  optimisticContextId: null,
  setSwitcherOpen: (isOpen) => set({ isSwitcherOpen: isOpen }),
  setSwitching: (isSwitching) => set({ isSwitching }),
  setOptimisticContextId: (id) => set({ optimisticContextId: id }),
}));

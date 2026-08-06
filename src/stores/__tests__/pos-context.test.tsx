import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

vi.mock('@/lib/domains/pos-pelkes/pos-pelkes.queries', () => ({
  useAssignedPosList: () => ({
    isLoading: false,
    data: [
      { id_pos: 'POS-00001', nama_pos: 'Pos Uji A' },
      { id_pos: 'POS-00002', nama_pos: 'Eben Haezer' },
    ],
  }),
}));

import { PosProvider, usePosContext } from '@/stores/pos-context';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PosProvider>{children}</PosProvider>
);

beforeEach(() => localStorage.clear());

describe('PosContext (VP-6)', () => {
  it('setActivePosId menyimpan preferensi ke localStorage', () => {
    const { result } = renderHook(() => usePosContext(), { wrapper });
    act(() => result.current.setActivePosId('POS-00002'));
    expect(localStorage.getItem('sigpib:active-pos')).toBe('POS-00002');
  });
});

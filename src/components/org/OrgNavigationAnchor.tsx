'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  Building, 
  HandHeart, 
  Map,
  BookOpen,
  History,
  UsersRound
} from 'lucide-react';

interface AnchorItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ANCHORS: AnchorItem[] = [
  { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'identitas', label: 'Identitas & Struktur', icon: <Network className="w-4 h-4" /> },
  { id: 'people', label: 'SDM', icon: <Users className="w-4 h-4" /> },
  { id: 'demografi', label: 'Demografi', icon: <UsersRound className="w-4 h-4" /> },
  { id: 'pastoral', label: 'Pastoral', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'assets', label: 'Aset', icon: <Building className="w-4 h-4" /> },
  { id: 'territory', label: 'Wilayah', icon: <Map className="w-4 h-4" /> },
  { id: 'aid-requests', label: 'Bantuan', icon: <HandHeart className="w-4 h-4" /> },
  { id: 'riwayat', label: 'Riwayat', icon: <History className="w-4 h-4" /> }
];

export const OrgNavigationAnchor: React.FC = () => {
  const [activeAnchor, setActiveAnchor] = useState<string>('overview');

  useEffect(() => {
    const rawHash = window.location.hash.replace('#', '');
    if (rawHash) {
      const match = ANCHORS.find((a) => a.id === rawHash);
      if (match) {
        setActiveAnchor(match.id);
        const timer = setTimeout(() => {
          const el = document.getElementById(match.id);
          if (el) {
            el.scrollIntoView({ behavior: 'auto' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveAnchor(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    ANCHORS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToAnchor = (id: string) => {
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav 
      aria-label="Navigasi Seksi Organisasi" 
      className="sticky top-0 z-30 bg-surface-elevated/95 backdrop-blur-md border-y border-border-subtle shadow-xs py-2 px-1"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        {ANCHORS.map((item) => {
          const isActive = activeAnchor === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToAnchor(item.id)}
              aria-selected={isActive}
              aria-label={`Pindah ke seksi ${item.label}`}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-xs'
                  : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

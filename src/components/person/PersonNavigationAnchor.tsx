'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  GraduationCap, 
  HeartHandshake 
} from 'lucide-react';

interface AnchorItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ANCHORS: AnchorItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
  { id: 'roles', label: 'Penugasan & Peran', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'competencies', label: 'Kapasitas', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'pastoral', label: 'Pastoral', icon: <HeartHandshake className="w-4 h-4" /> }
];

export const PersonNavigationAnchor: React.FC = () => {
  const [activeAnchor, setActiveAnchor] = useState<string>('overview');

  useEffect(() => {
    // 1. Initial Hash handling for cold-load deep linking
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

    // 2. Active section tracking via IntersectionObserver
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

  const handleClickAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav aria-label="Navigasi Seksi Person Workspace" className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 shadow-2xs py-2 px-1">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
        {ANCHORS.map((item) => {
          const isActive = activeAnchor === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClickAnchor(e, item.id)}
              aria-current={isActive ? 'location' : undefined}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};

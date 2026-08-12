'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

interface AnchorItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ANCHORS: AnchorItem[] = [
  { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
  { id: 'roles', label: 'Penugasan', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'competencies', label: 'Kompetensi', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'pastoral', label: 'Pastoral', icon: <BookOpen className="w-4 h-4" /> }
];

export const PersonNavigationAnchor: React.FC = () => {
  const [activeAnchor, setActiveAnchor] = useState<string>('profil');

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
    <nav aria-label="Navigasi Seksi Person Workspace" className="sticky top-0 z-30 bg-[#111A2B]/95 backdrop-blur-md border-y border-border-subtle shadow-xs py-2 px-1">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        {ANCHORS.map((item) => {
          const isActive = activeAnchor === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClickAnchor(e, item.id)}
              aria-current={isActive ? 'location' : undefined}
              aria-label={`Pindah ke seksi ${item.label}`}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
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

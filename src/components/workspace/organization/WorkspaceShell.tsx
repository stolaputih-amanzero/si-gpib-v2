import React from 'react';
import { cn } from '@/lib/utils';
import type { ContextLevel } from '@/lib/authorization/types/identity.types';

interface WorkspaceShellProps extends React.HTMLAttributes<HTMLDivElement> {
  contextLevel: ContextLevel;
  contextId: string;
  children: React.ReactNode;
}

export function WorkspaceShell({ 
  contextLevel, 
  contextId, 
  children, 
  className,
  ...props 
}: WorkspaceShellProps) {
  return (
    <div 
      className={cn("flex flex-col gap-6 px-4 py-6 w-full max-w-3xl mx-auto", className)}
      {...props}
    >
      {/* 
        PR-08: Workspace adalah tempat 'manage', bukan dashboard 'monitor'.
        Konten dirender berdasarkan context level melalui adaptive rendering 
      */}
      {children}
    </div>
  );
}

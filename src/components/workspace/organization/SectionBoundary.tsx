'use client';

import React from 'react';

interface SectionBoundaryProps {
  children: React.ReactNode;
}

interface SectionBoundaryState {
  hasError: boolean;
  isUnauthorized: boolean;
}

export class SectionBoundary extends React.Component<SectionBoundaryProps, SectionBoundaryState> {
  constructor(props: SectionBoundaryProps) {
    super(props);
    this.state = { hasError: false, isUnauthorized: false };
  }

  static getDerivedStateFromError(error: any): SectionBoundaryState {
    const isAuthError = 
      (error.name === 'AuthorizationError' && error.errorCode === 'NOT_AUTHORIZED') ||
      (error.message && error.message.includes('NOT_AUTHORIZED')) ||
      (error.message && error.message.includes('Not authenticated'));

    if (isAuthError) {
      return { hasError: true, isUnauthorized: true };
    }
    return { hasError: true, isUnauthorized: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isAuthError = 
      (error.name === 'AuthorizationError' && (error as any).errorCode === 'NOT_AUTHORIZED') ||
      (error.message && error.message.includes('NOT_AUTHORIZED')) ||
      (error.message && error.message.includes('Not authenticated'));

    if (!isAuthError) {
      console.error('Section Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.isUnauthorized) {
      // T2: HIDE
      return null;
    }
    if (this.state.hasError) {
      // Handle other errors gracefully
      return (
        <div className="p-4 border rounded-xl bg-destructive/10 text-destructive text-sm">
          Gagal memuat modul ini.
        </div>
      );
    }

    return this.props.children;
  }
}

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ProjectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Projection Error Boundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-surface-base p-6 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center text-center space-y-4 my-6">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1 max-w-md">
            <h2 className="text-lg font-bold text-text-high">
              {this.props.fallbackTitle || 'Gagal Memuat Lensa Proyeksi'}
            </h2>
            <p className="text-xs text-text-muted">
              Terjadi kesalahan saat mengolah agregasi data proyeksi ({this.state.error?.message || 'Error tidak terduga'}). Data Anda tetap aman.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-xl bg-surface-sunken hover:bg-surface-1 text-text-high text-xs font-bold border border-border-subtle flex items-center gap-2 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

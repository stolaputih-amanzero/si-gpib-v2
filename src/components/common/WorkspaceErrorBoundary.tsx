'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workspace Error Boundary caught an exception:', error, errorInfo);
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
        <div className="min-h-[450px] bg-slate-950 p-8 rounded-3xl border border-border-subtle flex flex-col items-center justify-center text-center space-y-4 my-8 max-w-2xl mx-auto shadow-2xl">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold text-slate-100">
              Gagal Memuat Ruang Kerja (Workspace)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Terjadi kendala saat merender komponen Ruang Kerja ({this.state.error?.message || 'Gagal merender data entitas'}). Anda dapat memuat ulang atau kembali ke Beranda.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-border-subtle flex items-center gap-2 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Muat Ulang Ruang Kerja</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 min-h-[44px]"
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

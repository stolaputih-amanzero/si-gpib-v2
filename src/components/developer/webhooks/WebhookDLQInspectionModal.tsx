'use client';

import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck, RotateCw } from 'lucide-react';
import { WebhookDeliveryItemViewModel } from '@/types/webhookEngineViewModel.types';

interface WebhookDLQInspectionModalProps {
  delivery: WebhookDeliveryItemViewModel | null;
  onClose: () => void;
  onTriggerReplayIntent?: (deliveryId: string) => void;
}

export const WebhookDLQInspectionModal: React.FC<WebhookDLQInspectionModalProps> = ({
  delivery,
  onClose,
  onTriggerReplayIntent
}) => {
  const [replayTriggered, setReplayTriggered] = useState(false);

  if (!delivery) return null;

  const handleReplayClick = () => {
    setReplayTriggered(true);
    if (onTriggerReplayIntent) {
      onTriggerReplayIntent(delivery.delivery_id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Inspeksi Webhook Outbound Delivery</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* DLQ Alert Card */}
          {delivery.isDLQ && (
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  DEAD-LETTER QUEUE (DLQ) EXHAUSTED
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  DLQ
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Pengiriman telah menghabiskan batas percobaan (retry threshold). Memerlukan tindakan replay admin terotorisasi F12.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 font-semibold">Delivery ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{delivery.delivery_id}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 font-semibold">Event ID Provenance (F11)</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{delivery.event_id}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 font-semibold">Target Endpoint ID</span>
            <span className="font-mono font-medium text-slate-900 dark:text-slate-100">{delivery.endpoint_id}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-500 font-semibold">Status & Percobaan</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{delivery.statusLabel} ({delivery.attemptsFormatted})</span>
          </div>

          {/* HMAC Signature & Secret Isolation Warning */}
          <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-bold">Keamanan Signature (HMAC-SHA256)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div><span className="text-slate-500">Header:</span> "X-GPIB-Signature: t=1750000000,v1=..."</div>
            <div><span className="text-slate-500">Secret:</span> "••••••••••••" (Protected at Rest)</div>
          </div>
        </div>

        {/* Action Replay Intent Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Tutup Inspeksi
          </button>

          {delivery.isDLQ && (
            <button
              onClick={handleReplayClick}
              disabled={replayTriggered}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${replayTriggered ? 'bg-slate-300 text-slate-600' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md'}`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${replayTriggered ? 'animate-spin' : ''}`} />
              {replayTriggered ? 'Intent Sent to F12 Server...' : 'Trigger Authorized DLQ Replay Intent'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

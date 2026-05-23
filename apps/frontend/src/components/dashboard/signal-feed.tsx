import { motion } from 'framer-motion';
import { AlertTriangle, ArrowDown, ArrowUp, Clock, Minus } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { Signal } from '@ghostfx/shared-types';

function ActionIcon({ action }: { action: string }) {
  if (action === 'BUY') return <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
  if (action === 'SELL') return <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
  if (action === 'DO_NOT_TRADE') return <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
  return <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
}

const actionStyles: Record<string, string> = {
  BUY: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  SELL: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
  WAIT: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  DO_NOT_TRADE: 'bg-red-400/15 text-red-300 border-red-400/20',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SignalFeed({ signals }: { signals?: Signal[] }) {
  const list = signals?.slice(0, 6) ?? [];

  return (
    <Card data-signals>
      <CardHeader>
        <div>
          <Badge className="mb-3 w-fit bg-violet-400/10 text-violet-200">AI signal feed</Badge>
          <CardTitle className="text-base sm:text-lg">Opportunities &amp; stay-out warnings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/5 p-6 text-center text-xs text-slate-500 sm:p-8 sm:text-sm">
            No signals yet. The AI is scanning markets for clean setups.
          </div>
        )}
        {list.map((signal, i) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            data-signal-feed
            className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] sm:p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 sm:mb-3 sm:gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-base font-bold text-white sm:text-lg">{signal.symbol}</span>
                <span className="text-[10px] text-slate-500 sm:text-xs">{signal.timeframe}</span>
                <span className="flex items-center gap-1 text-[9px] text-slate-500 sm:text-[10px]">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {timeAgo(signal.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-xs ${actionStyles[signal.action] ?? 'bg-white/10 text-white'}`}>
                  <ActionIcon action={signal.action} />
                  {signal.action === 'DO_NOT_TRADE' ? 'Stay Out' : signal.action}
                </span>
                <span className="rounded-lg bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-200 sm:px-2 sm:py-1 sm:text-xs">
                  {signal.confidence}%
                </span>
              </div>
            </div>
            <p className="mb-2 text-[11px] leading-relaxed text-slate-300 sm:mb-3 sm:text-sm">{signal.agent_summary}</p>
            {signal.action !== 'WAIT' && signal.action !== 'DO_NOT_TRADE' && (
              <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:gap-2 sm:text-xs">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 sm:p-2">
                  <span className="text-slate-500">Entry</span>
                  <p className="mt-0.5 font-medium text-white">{signal.entry_price}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 sm:p-2">
                  <span className="text-slate-500">Stop</span>
                  <p className="mt-0.5 font-medium text-rose-300">{signal.stop_loss}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 sm:p-2">
                  <span className="text-slate-500">Target</span>
                  <p className="mt-0.5 font-medium text-emerald-300">{signal.take_profit}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

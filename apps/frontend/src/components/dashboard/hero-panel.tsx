import { motion } from 'framer-motion';
import { AlertTriangle, BrainCircuit, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { AgentSummary, Signal } from '@ghostfx/shared-types';

const actionColors: Record<string, string> = {
  BUY: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  SELL: 'bg-rose-400/20 text-rose-300 border-rose-400/30',
  WAIT: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  DO_NOT_TRADE: 'bg-red-400/20 text-red-300 border-red-400/30',
};

const actionIcons: Record<string, React.ReactNode> = {
  BUY: <TrendingUp className="h-4 w-4" />,
  SELL: <TrendingUp className="h-4 w-4 rotate-180" />,
  WAIT: <AlertTriangle className="h-4 w-4" />,
  DO_NOT_TRADE: <AlertTriangle className="h-4 w-4" />,
};

function getActionLabel(action?: string): string {
  if (!action || action === 'WAIT') return 'Hold';
  if (action === 'DO_NOT_TRADE') return 'Stay Out';
  return action;
}

export function HeroPanel({ summary, signal }: { summary?: AgentSummary; signal?: Signal }) {
  const topMarkets = summary?.strongest_markets ?? [];
  const avoidMarkets = summary?.avoid_markets ?? [];
  const action = signal?.action ?? 'WAIT';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-3 lg:grid-cols-[1.6fr_1fr]"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/5 via-slate-900 to-emerald-500/5">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />

        <CardHeader>
          <div className="min-w-0">
            <Badge className="mb-2 w-fit bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 text-cyan-200 sm:mb-3">
              <Sparkles className="mr-1 h-3 w-3" />
              AI market posture
            </Badge>
            <CardTitle className="text-base leading-relaxed sm:text-xl md:text-2xl">
              {summary?.guidance ?? 'Markets are being scanned for high-quality opportunities with protective risk filters.'}
            </CardTitle>
          </div>
          <BrainCircuit className="hidden h-8 w-8 shrink-0 text-cyan-300 sm:block" />
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
              <p className="mb-1 text-[10px] text-slate-500 sm:text-xs">Status</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 sm:h-2 sm:w-2" />
                {summary?.status ?? 'Monitoring'}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
              <p className="mb-1 text-[10px] text-slate-500 sm:text-xs">Protection</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
                <ShieldCheck className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" />
                {summary?.protection_mode ?? 'Active'}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
              <p className="mb-1 text-[10px] text-slate-500 sm:text-xs">Posture</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold capitalize text-white sm:text-sm">
                {summary?.market_posture ?? 'Selective'}
              </p>
            </div>
          </div>

          {(topMarkets.length > 0 || avoidMarkets.length > 0) && (
            <div className="flex flex-wrap gap-2 text-[10px] sm:gap-4 sm:text-xs">
              {topMarkets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500">Strongest:</span>
                  {topMarkets.map((m) => (
                    <span key={m} className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300 sm:px-2">
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {avoidMarkets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-500">Avoid:</span>
                  {avoidMarkets.map((m) => (
                    <span key={m} className="rounded-md border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 text-rose-300 sm:px-2">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl" />

        <CardHeader>
          <div className="min-w-0">
            <Badge className="mb-2 w-fit bg-white/5 text-slate-300 sm:mb-3">Latest signal</Badge>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {signal?.symbol ?? 'EURUSD'}
              <span className="text-[10px] font-normal text-slate-500 sm:text-xs">{signal?.timeframe ?? 'M15'}</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-base font-bold sm:px-4 sm:py-2 sm:text-lg ${actionColors[action] ?? 'bg-white/10 text-white'}`}>
            {actionIcons[action]}
            {getActionLabel(action)}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400">Confidence</span>
                <span className="font-medium text-white">{signal?.confidence ?? 0}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10 sm:h-2">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${signal?.confidence ?? 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 sm:text-sm">Risk level</span>
              <Badge className={
                signal?.risk_level === 'HIGH' ? 'bg-rose-400/20 text-rose-200' :
                signal?.risk_level === 'MEDIUM' ? 'bg-amber-400/20 text-amber-200' :
                'bg-emerald-400/20 text-emerald-200'
              }>
                {signal?.risk_level ?? 'LOW'}
              </Badge>
            </div>

            {signal && (
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] sm:gap-2 sm:text-xs">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-1.5 sm:p-2">
                  <span className="text-slate-500">Entry</span>
                  <p className="mt-0.5 font-medium text-white">{signal.entry_price}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-1.5 sm:p-2">
                  <span className="text-slate-500">Stop</span>
                  <p className="mt-0.5 font-medium text-rose-300">{signal.stop_loss}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-1.5 sm:p-2">
                  <span className="text-slate-500">Target</span>
                  <p className="mt-0.5 font-medium text-emerald-300">{signal.take_profit}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-2 text-[11px] text-amber-100/80 sm:p-3 sm:text-sm">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-amber-200/60 sm:text-xs">
              <ShieldCheck className="h-3 w-3" />
              Guardrail note
            </div>
            {signal?.agent_summary ?? 'The agent will wait for clean confluent conditions before recommending a trade.'}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

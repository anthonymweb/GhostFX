import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { Portfolio } from '@ghostfx/shared-types';

const mockEquity = Array.from({ length: 20 }, (_, i) => ({
  day: i,
  value: 10000 + Math.sin(i * 0.5) * 300 + (Math.random() - 0.5) * 200 + i * 15,
}));

export function PortfolioPanel({ portfolio }: { portfolio?: Portfolio }) {
  const balance = portfolio?.balance ?? 10000;
  const equity = portfolio?.equity ?? 10000;
  const maxLoss = portfolio?.max_daily_loss ?? 300;
  const pnl = equity - balance;
  const pnlPercent = (pnl / balance) * 100;
  const dailyLossUsed = Math.min(Math.abs(pnl) / maxLoss, 1);
  const lastEq = mockEquity[mockEquity.length - 1]?.value ?? 10000;
  const eqChange = ((lastEq - 10000) / 10000) * 100;
  const eqUp = eqChange >= 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <Badge className="mb-3 w-fit bg-emerald-400/10 text-emerald-200">Paper trading</Badge>
          <CardTitle className="text-base sm:text-lg">{portfolio?.name ?? 'Primary Portfolio'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">Balance</p>
            <p className="mt-0.5 text-sm font-bold text-white sm:text-lg">${balance.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">Equity</p>
            <p className="mt-0.5 text-sm font-bold text-white sm:text-lg">${equity.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2 sm:p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">P&L</p>
            <p className={`mt-0.5 text-sm font-bold sm:text-lg ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
              <span className="ml-0.5 text-[9px] sm:ml-1 sm:text-xs">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)</span>
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-slate-500">Daily loss limit</span>
            <span className="text-slate-300">${Math.abs(pnl).toFixed(0)} / ${maxLoss.toFixed(0)}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10 sm:h-1.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(dailyLossUsed * 100, 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] sm:mb-2 sm:text-xs">
            <span className="text-slate-500">Portfolio performance</span>
            <span className={`font-medium ${eqUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {eqUp ? '+' : ''}{eqChange.toFixed(1)}%
            </span>
          </div>
          <div className="h-12 w-full sm:h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockEquity}>
                <defs>
                  <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={eqUp ? '#34d399' : '#fb7185'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={eqUp ? '#34d399' : '#fb7185'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={eqUp ? '#34d399' : '#fb7185'}
                  strokeWidth={2}
                  fill="url(#eqGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:gap-2 sm:text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 sm:p-2">
            <span className="text-slate-500">Daily loss cap</span>
            <p className="mt-0.5 font-medium text-white">${portfolio?.max_daily_loss.toFixed(2) ?? '300.00'}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 sm:p-2">
            <span className="text-slate-500">Risk per trade</span>
            <p className="mt-0.5 font-medium text-white">{(portfolio?.max_risk_per_trade ?? 0.01) * 100}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

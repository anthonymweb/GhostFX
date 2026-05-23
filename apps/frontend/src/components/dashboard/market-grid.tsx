import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { MarketOverview, MarketQuote } from '@ghostfx/shared-types';

function Sparkline({ positive }: { positive: boolean }) {
  const data = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        v: 50 + Math.sin(i * 0.8) * 15 + (Math.random() - 0.5) * 10,
      })),
    [],
  );

  return (
    <div className="h-6 w-full sm:h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={positive ? '#34d399' : '#fb7185'}
            strokeWidth={1.5}
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function QuoteCard({ quote }: { quote: MarketQuote }) {
  const positive = quote.change_percent >= 0;
  return (
    <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] sm:p-3">
      <div className="mb-1.5 flex items-center justify-between sm:mb-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white sm:text-sm">{quote.symbol}</p>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px]">{quote.asset_class}</p>
        </div>
        <Badge className={`shrink-0 text-[10px] sm:text-xs ${positive ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>
          {positive ? '+' : ''}{quote.change_percent}%
        </Badge>
      </div>
      <Sparkline positive={positive} />
      <div className="mt-1.5 grid grid-cols-3 gap-1 text-[9px] sm:mt-2 sm:gap-1 sm:text-[10px]">
        <div className="min-w-0">
          <span className="text-slate-500">Price</span>
          <p className="truncate font-medium text-white">{quote.price}</p>
        </div>
        <div className="min-w-0">
          <span className="text-slate-500">Volatility</span>
          <p className="font-medium text-white">{quote.volatility}%</p>
        </div>
        <div className="min-w-0">
          <span className="text-slate-500">Sentiment</span>
          <p className="truncate font-medium capitalize text-white">{quote.sentiment}</p>
        </div>
      </div>
    </div>
  );
}

export function MarketGrid({ overview }: { overview?: MarketOverview }) {
  const quotes = overview?.quotes ?? [];

  const sorted = useMemo(
    () => [...quotes].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)),
    [quotes],
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3 w-fit bg-blue-400/10 text-blue-200">Autonomous monitoring</Badge>
          <CardTitle className="text-base sm:text-lg">Multi-market scan</CardTitle>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs font-medium text-emerald-300 sm:text-sm">{overview?.opportunities ?? 0} opportunities</div>
          <div className="text-[10px] text-rose-300 sm:text-xs">{overview?.do_not_trade_count ?? 0} avoid alerts</div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
        {sorted.map((quote) => (
          <QuoteCard key={quote.symbol} quote={quote} />
        ))}
      </CardContent>
    </Card>
  );
}

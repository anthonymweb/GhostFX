import { TrendingDown, TrendingUp } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { MarketOverview } from '@ghostfx/shared-types';

export function MarketGrid({ overview }: { overview?: MarketOverview }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3">Autonomous monitoring</Badge>
          <CardTitle>Live multi-market scan</CardTitle>
        </div>
        <div className="text-right text-sm text-slate-400">
          <div>{overview?.opportunities ?? 0} opportunities</div>
          <div>{overview?.do_not_trade_count ?? 0} avoid alerts</div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {overview?.quotes?.map((quote) => {
          const positive = quote.change_percent >= 0;
          return (
            <div key={quote.symbol} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="m-0 text-lg font-semibold text-white">{quote.symbol}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{quote.asset_class}</p>
                </div>
                <Badge className={positive ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200'}>
                  {positive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  {quote.change_percent}%
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white">{quote.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Volatility</span>
                  <span className="text-white">{quote.volatility}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sentiment</span>
                  <span className="capitalize text-white">{quote.sentiment}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

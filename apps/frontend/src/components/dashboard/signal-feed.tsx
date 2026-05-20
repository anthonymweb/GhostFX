import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { Signal } from '@ghostfx/shared-types';

export function SignalFeed({ signals }: { signals?: Signal[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3">AI signal feed</Badge>
          <CardTitle>Actionable opportunities and stay-out warnings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals?.slice(0, 6).map((signal) => (
          <div key={signal.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="m-0 text-lg font-semibold text-white">{signal.symbol}</p>
                <p className="mt-1 text-sm text-slate-400">{signal.timeframe} • {signal.asset_class}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{signal.action}</Badge>
                <Badge className="bg-cyan-400/10 text-cyan-100">{signal.confidence}% confidence</Badge>
              </div>
            </div>
            <p className="mb-3 text-sm text-slate-300">{signal.agent_summary}</p>
            <div className="grid gap-2 text-sm md:grid-cols-3">
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">Entry</span>
                <p className="mt-1 text-white">{signal.entry_price}</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">Stop loss</span>
                <p className="mt-1 text-white">{signal.stop_loss}</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <span className="text-slate-400">Take profit</span>
                <p className="mt-1 text-white">{signal.take_profit}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

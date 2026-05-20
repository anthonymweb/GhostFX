import { DollarSign, Shield, TrendingUp } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { Portfolio } from '@ghostfx/shared-types';

export function PortfolioPanel({ portfolio }: { portfolio?: Portfolio }) {
  const stats = [
    { label: 'Balance', value: `$${portfolio?.balance.toFixed(2) ?? '0.00'}`, icon: DollarSign },
    { label: 'Equity', value: `$${portfolio?.equity.toFixed(2) ?? '0.00'}`, icon: TrendingUp },
    { label: 'Daily loss cap', value: `$${portfolio?.max_daily_loss.toFixed(2) ?? '0.00'}`, icon: Shield },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3">Paper trading</Badge>
          <CardTitle>{portfolio?.name ?? 'Primary Paper Portfolio'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <item.icon className="mb-3 h-5 w-5 text-cyan-200" />
            <p className="m-0 text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

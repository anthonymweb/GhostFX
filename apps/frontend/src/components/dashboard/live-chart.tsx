import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

type Candle = {
  time: string;
  price: number;
  ma7: number;
  ma25: number;
};

function generatePrice(prev: number, drift = 0): number {
  const change = (Math.random() - 0.5 + drift) * 0.002;
  return prev * (1 + change);
}

function buildInitialData(count: number): { data: Candle[]; lastPrice: number } {
  let price = 1.0850 + (Math.random() - 0.5) * 0.02;
  const data: Candle[] = [];
  const prices: number[] = [];
  for (let i = 0; i < count; i++) {
    price = generatePrice(price);
    prices.push(price);
    const ma7 = prices.slice(-7).reduce((a, b) => a + b, 0) / Math.min(prices.length, 7);
    const ma25 = prices.slice(-25).reduce((a, b) => a + b, 0) / Math.min(prices.length, 25);
    const mins = i * 5;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    data.push({
      time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      price: +price.toFixed(5),
      ma7: +ma7.toFixed(5),
      ma25: +ma25.toFixed(5),
    });
  }
  return { data, lastPrice: price };
}

export function LiveChart() {
  const [data, setData] = useState<Candle[]>([]);
  const driftRef = useRef((Math.random() - 0.5) * 0.0005);

  useEffect(() => {
    const { data: initial } = buildInitialData(50);
    setData(initial);

    const interval = setInterval(() => {
      driftRef.current += (Math.random() - 0.5) * 0.0002;
      driftRef.current = Math.max(-0.001, Math.min(0.001, driftRef.current));

      setData((prev) => {
        const lastPrice = prev[prev.length - 1]?.price ?? 1.08;
        const newPrice = generatePrice(lastPrice, driftRef.current);
        const allPrices = [...prev.map((d) => d.price), newPrice];
        const len = allPrices.length;
        const ma7 = allPrices.slice(-7).reduce((a, b) => a + b, 0) / Math.min(len, 7);
        const ma25 = allPrices.slice(-25).reduce((a, b) => a + b, 0) / Math.min(len, 25);

        const totalMins = len * 5;
        const h = Math.floor(totalMins / 60) % 24;
        const m = totalMins % 60;

        const newPoint: Candle = {
          time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          price: +newPrice.toFixed(5),
          ma7: +ma7.toFixed(5),
          ma25: +ma25.toFixed(5),
        };

        const next = [...prev.slice(Math.max(0, prev.length - 59)), newPoint];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const last = data[data.length - 1];
  const first = data[0];
  const change = last && first ? ((last.price - first.price) / first.price) * 100 : 0;
  const isUp = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      data-chart
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="min-w-0">
            <Badge className="mb-3 w-fit bg-cyan-400/10 text-cyan-200">
              <Activity className="mr-1 h-3 w-3" />
              Live simulated feed
            </Badge>
            <CardTitle className="text-lg sm:text-2xl">EURUSD price action</CardTitle>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <span className="text-lg font-bold text-white sm:text-2xl">{last?.price ?? '---'}</span>
            <span className={`flex items-center gap-1 text-xs font-medium sm:text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${isUp ? '' : 'rotate-180'}`} />
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-3 pr-2 sm:pb-4 sm:pr-4">
          <div className="mb-2 flex gap-3 overflow-x-auto px-4 text-[10px] text-slate-500 sm:mb-3 sm:px-6 sm:text-xs">
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded bg-cyan-400" />
              Price
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded bg-orange-400" />
              MA(7)
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded bg-violet-400" />
              MA(25)
            </span>
          </div>
          <div className="h-[200px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => v.toFixed(4)}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} fill="url(#priceGradient)" dot={false} />
                <Area type="monotone" dataKey="ma7" stroke="#f97316" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
                <Area type="monotone" dataKey="ma25" stroke="#a78bfa" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo } from 'react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { MarketOverview } from '@ghostfx/shared-types';

function GaugeNeedle({ value }: { value: number }) {
  const springVal = useSpring(value, { stiffness: 40, damping: 15 });
  const angle = useTransform(springVal, [0, 50, 100], [-90, 0, 90]);

  return (
    <motion.g style={{ rotate: angle, transformOrigin: '50% 100%' }}>
      <line x1="50" y1="80" x2="50" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="80" r="5" fill="white" />
      <circle cx="50" cy="80" r="2.5" fill="#020617" />
    </motion.g>
  );
}

function Arc({ from, to, color, opacity = 0.15 }: { from: number; to: number; color: string; opacity?: number }) {
  const r = 68;
  const cx = 50;
  const cy = 85;
  const startAngle = ((from - 180) * Math.PI) / 180;
  const endAngle = ((to - 180) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = to - from > 180 ? 1 : 0;

  return (
    <path
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth="10"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

type Sentiment = {
  score: number;
  label: string;
  direction: string;
  volatility: string;
  summary: string;
};

function computeSentiment(overview?: MarketOverview): Sentiment {
  if (!overview?.quotes?.length) {
    return { score: 50, label: 'Neutral', direction: 'Mixed', volatility: 'Moderate', summary: 'Markets are balanced. Waiting for clearer directional bias.' };
  }

  const quotes = overview.quotes;
  const avgChange = quotes.reduce((s, q) => s + q.change_percent, 0) / quotes.length;
  const avgVol = quotes.reduce((s, q) => s + q.volatility, 0) / quotes.length;
  const positiveCount = quotes.filter((q) => q.change_percent >= 0).length;
  const ratio = positiveCount / quotes.length;

  const score = Math.round(ratio * 100);
  const clamped = Math.max(10, Math.min(90, score));

  let label: string;
  let direction: string;
  if (clamped >= 65) { label = 'Bullish'; direction = 'Upward'; }
  else if (clamped >= 40) { label = 'Neutral'; direction = 'Mixed'; }
  else { label = 'Bearish'; direction = 'Downward'; }

  const volLabel = avgVol > 1.5 ? 'Elevated' : avgVol > 0.5 ? 'Moderate' : 'Low';

  let summary: string;
  if (label === 'Bullish') summary = `Markets leaning bullish (${positiveCount}/${quotes.length} pairs positive). Bias is upward with ${volLabel.toLowerCase()} volatility.`;
  else if (label === 'Bearish') summary = `Markets leaning bearish (${quotes.length - positiveCount}/${quotes.length} pairs negative). ${volLabel === 'Elevated' ? 'Caution advised — volatility is elevated.' : 'Defensive posture recommended.'}`;
  else summary = `Markets are mixed (${positiveCount}/${quotes.length} positive). ${volLabel === 'Elevated' ? 'Volatility is elevated — wait for clearer setups.' : 'Waiting for stronger directional conviction.'}`;

  return { score: clamped, label, direction, volatility: volLabel, summary };
}

export function MarketSentiment({ overview }: { overview?: MarketOverview }) {
  const sentiment = useMemo(() => computeSentiment(overview), [overview]);
  const color = sentiment.label === 'Bullish' ? '#34d399' : sentiment.label === 'Bearish' ? '#fb7185' : '#fbbf24';

  const strongest = overview?.strongest_pairs?.slice(0, 3) ?? [];
  const quotes = overview?.quotes ?? [];
  const topGainers = [...quotes].sort((a, b) => b.change_percent - a.change_percent).slice(0, 3);
  const topLosers = [...quotes].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <Badge className="mb-3 bg-gradient-to-r from-amber-400/10 to-rose-400/10 text-amber-200">
            Market pulse
          </Badge>
          <CardTitle>Sentiment compass</CardTitle>
        </div>
        <span className="text-xs text-slate-500">AI-aggregated</span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative flex-shrink-0">
            <svg viewBox="0 0 100 100" className="h-36 w-36 sm:h-44 sm:w-44">
              <Arc from={180} to={270} color="#34d399" opacity={0.25} />
              <Arc from={270} to={360} color="#fbbf24" opacity={0.15} />
              <Arc from={0} to={90} color="#fb7185" opacity={0.25} />
              <text x="12" y="60" fontSize="6" fill="#64748b" textAnchor="middle">Bullish</text>
              <text x="88" y="60" fontSize="6" fill="#64748b" textAnchor="middle">Bearish</text>
              <text x="50" y="75" fontSize="5" fill="#475569" textAnchor="middle">Neutral</text>
              <GaugeNeedle value={sentiment.score} />
              <text x="50" y="55" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">
                {sentiment.score}%
              </text>
              <text x="50" y="64" fontSize="5" fill={color} textAnchor="middle">
                {sentiment.label}
              </text>
            </svg>
          </div>

          <div className="flex-1 space-y-3 self-center sm:self-auto">
            <div className="grid grid-cols-2 gap-2 text-center text-xs sm:text-left">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                <span className="text-slate-500">Direction</span>
                <p className="mt-0.5 font-medium text-white">{sentiment.direction}</p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                <span className="text-slate-500">Volatility</span>
                <p className={`mt-0.5 font-medium ${sentiment.volatility === 'Elevated' ? 'text-amber-300' : 'text-white'}`}>
                  {sentiment.volatility}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">{sentiment.summary}</p>

            <div className="flex flex-wrap gap-3 text-[10px]">
              {topGainers.length > 0 && (
                <div>
                  <span className="text-slate-500">Top gainers</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {topGainers.map((q) => (
                      <span key={q.symbol} className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300">
                        {q.symbol} +{q.change_percent}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {topLosers.length > 0 && (
                <div>
                  <span className="text-slate-500">Top losers</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {topLosers.map((q) => (
                      <span key={q.symbol} className="rounded-md border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 text-rose-300">
                        {q.symbol} {q.change_percent}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

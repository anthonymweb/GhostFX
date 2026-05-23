import { motion } from 'framer-motion';
import { Eye, EyeOff, SlidersHorizontal, Sparkles } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@ghostfx/ui';

import type { ExperienceMode } from '@ghostfx/shared-types';
import { useUiStore } from '@/store/ui-store';

const modes: {
  key: ExperienceMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}[] = [
  {
    key: 'beginner',
    icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />,
    title: 'Beginner',
    description: 'Simplified guidance with strong guardrails.',
    features: ['Auto-filtered signals', 'Plain-language summaries', 'Maximum risk protection', '1-click trades'],
  },
  {
    key: 'intermediate',
    icon: <Eye className="h-4 w-4 sm:h-5 sm:w-5" />,
    title: 'Intermediate',
    description: 'Balanced visibility with risk summaries.',
    features: ['Full signal reasoning', 'Multi-timeframe context', 'Risk-adjusted sizing', 'Market sentiment'],
  },
  {
    key: 'advanced',
    icon: <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />,
    title: 'Advanced',
    description: 'Full insights and control surfaces.',
    features: ['Technical indicators', 'Custom risk params', 'Multi-pair correlation', 'Manual overrides'],
  },
];

export function ModeSelector() {
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);

  return (
    <Card>
      <CardHeader>
        <div>
          <Badge className="mb-3 w-fit bg-purple-400/10 text-purple-200">
            <SlidersHorizontal className="mr-1 h-3 w-3" />
            Experience level
          </Badge>
          <CardTitle className="text-base sm:text-lg">Trading mode</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <p className="text-[11px] text-slate-400 sm:text-sm">
          Choose how the AI presents signals. You can switch anytime.
        </p>
        {modes.map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`group relative w-full rounded-xl border p-3 text-left transition-all duration-200 sm:p-4 ${
                active
                  ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-400/10 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.08)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mode-bg"
                  className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/5 to-transparent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative flex items-start gap-2 sm:gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-10 sm:w-10 ${
                  active ? 'border-cyan-400/30 bg-cyan-400/20 text-cyan-300' : 'border-white/5 bg-white/[0.03] text-slate-400 group-hover:text-slate-300'
                }`}>
                  {m.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold sm:text-sm ${active ? 'text-white' : 'text-slate-300'}`}>
                      {m.title}
                    </span>
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[8px] font-bold text-slate-950 sm:h-5 sm:w-5 sm:text-[10px]"
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-[10px] sm:text-xs ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                    {m.description}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.features.map((f) => (
                      <span
                        key={f}
                        className={`rounded-md px-1 py-0.5 text-[9px] sm:px-1.5 sm:text-[10px] ${
                          active ? 'bg-cyan-400/10 text-cyan-200' : 'bg-white/[0.03] text-slate-500'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

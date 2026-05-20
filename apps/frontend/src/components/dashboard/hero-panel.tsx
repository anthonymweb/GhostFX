import { motion } from 'framer-motion';
import { Activity, BrainCircuit, ShieldAlert } from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@ghostfx/ui';

import type { AgentSummary, Signal } from '@ghostfx/shared-types';

export function HeroPanel({ summary, signal }: { summary?: AgentSummary; signal?: Signal }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 lg:grid-cols-[1.6fr_1fr]"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-cyan-400/10 via-slate-950/70 to-emerald-400/10">
        <CardHeader>
          <div>
            <Badge className="mb-3 bg-cyan-400/10 text-cyan-200">AI market posture</Badge>
            <CardTitle className="text-2xl md:text-3xl">
              {summary?.guidance ?? 'Monitoring markets and protecting users from low-quality setups.'}
            </CardTitle>
          </div>
          <BrainCircuit className="h-8 w-8 text-cyan-300" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm text-slate-400">Status</p>
            <p className="text-xl font-semibold text-white">{summary?.status ?? 'monitoring'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm text-slate-400">Protection mode</p>
            <p className="text-xl font-semibold text-white">{summary?.protection_mode ?? 'active'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm text-slate-400">Posture</p>
            <p className="text-xl font-semibold text-white">{summary?.market_posture ?? 'selective'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-3 bg-white/10 text-slate-200">Active setup</Badge>
            <CardTitle>{signal?.symbol ?? 'Waiting for scan'}</CardTitle>
          </div>
          <Activity className="h-8 w-8 text-emerald-300" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Action</span>
            <Badge className="bg-white/10 text-white">{signal?.action ?? 'WAIT'}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Confidence</span>
              <span>{signal?.confidence ?? 0}%</span>
            </div>
            <Progress value={signal?.confidence ?? 0} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Risk</span>
            <span className="text-sm font-medium text-white">{signal?.risk_level ?? 'LOW'}</span>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4" />
              Protective guidance
            </div>
            {signal?.agent_summary ?? 'The agent will prefer no trade over a forced trade.'}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useEffect } from 'react';

import { LoadingPanel } from '@/components/common/loading-panel';
import { AssistantChat } from '@/components/chat/assistant-chat';
import { HeroPanel } from '@/components/dashboard/hero-panel';
import { LiveChart } from '@/components/dashboard/live-chart';
import { MarketGrid } from '@/components/dashboard/market-grid';
import { MarketSentiment } from '@/components/dashboard/market-sentiment';
import { ModeSelector } from '@/components/dashboard/mode-selector';
import { PortfolioPanel } from '@/components/dashboard/portfolio-panel';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SignalFeed } from '@/components/dashboard/signal-feed';
import { TelegramPanel } from '@/components/dashboard/telegram-panel';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="mb-3 sm:mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-[10px] font-bold text-cyan-300 sm:h-7 sm:w-7 sm:text-xs">
          {number}
        </span>
        <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
      </div>
      <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">{description}</p>
    </div>
  );
}

export function DashboardPage() {
  const { agentSummary, latestSignal, marketOverview, portfolios, signalFeed } = useDashboardData('EURUSD', 'M15');
  const user = useAuthStore((s) => s.user);
  const setUiMode = useUiStore((s) => s.setMode);

  useEffect(() => {
    if (user?.experience_mode) {
      setUiMode(user.experience_mode);
    }
  }, [user?.experience_mode, setUiMode]);

  const loading =
    agentSummary.isLoading ||
    latestSignal.isLoading ||
    marketOverview.isLoading ||
    portfolios.isLoading ||
    signalFeed.isLoading;

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4">
        <LoadingPanel />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <LoadingPanel />
          <LoadingPanel />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
      <section>
        <SectionHeading
          number="01"
          title="AI market overview"
          description="Real-time AI assessment of market conditions. The agent scans all pairs and assigns a protective posture."
        />
        <HeroPanel summary={agentSummary.data} signal={latestSignal.data} />
      </section>

      <section>
        <SectionHeading
          number="02"
          title="Live price chart"
          description="Real-time simulated EURUSD chart with 7 & 25-period moving averages. Updates every 2.5s."
        />
        <LiveChart />
      </section>

      <section>
        <SectionHeading
          number="03"
          title="Market pulse &amp; sentiment"
          description="AI-aggregated market sentiment gauge showing directional bias, volatility, and top movers."
        />
        <MarketSentiment overview={marketOverview.data} />
      </section>

      <section>
        <SectionHeading
          number="04"
          title="Market scanner &amp; controls"
          description="Monitor live quotes, choose your experience mode, connect Telegram, and track your paper portfolio."
        />
        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr] xl:gap-4">
          <MarketGrid overview={marketOverview.data} />
          <div className="grid gap-3 xl:gap-4">
            <ModeSelector />
            <TelegramPanel />
            <PortfolioPanel portfolio={portfolios.data?.[0]} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          number="05"
          title="Signals &amp; AI assistant"
          description="Browse recent AI-generated trading signals with detailed reasoning, or ask the assistant about market conditions."
        />
        <div className="grid gap-3 xl:grid-cols-[1.3fr_0.9fr] xl:gap-4">
          <SignalFeed signals={signalFeed.data} />
          <AssistantChat />
        </div>
      </section>

      <QuickActions />
    </motion.div>
  );
}

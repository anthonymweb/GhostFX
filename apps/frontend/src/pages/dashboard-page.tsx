import { motion } from 'framer-motion';

import { LoadingPanel } from '@/components/common/loading-panel';
import { AssistantChat } from '@/components/chat/assistant-chat';
import { HeroPanel } from '@/components/dashboard/hero-panel';
import { MarketGrid } from '@/components/dashboard/market-grid';
import { ModeSelector } from '@/components/dashboard/mode-selector';
import { PortfolioPanel } from '@/components/dashboard/portfolio-panel';
import { SignalFeed } from '@/components/dashboard/signal-feed';
import { TelegramPanel } from '@/components/dashboard/telegram-panel';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function DashboardPage() {
  const { agentSummary, latestSignal, marketOverview, portfolios, signalFeed } = useDashboardData('EURUSD', 'M15');
  const loading =
    agentSummary.isLoading ||
    latestSignal.isLoading ||
    marketOverview.isLoading ||
    portfolios.isLoading ||
    signalFeed.isLoading;

  if (loading) {
    return (
      <div className="grid gap-4">
        <LoadingPanel />
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingPanel />
          <LoadingPanel />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
      <HeroPanel summary={agentSummary.data} signal={latestSignal.data} />

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <MarketGrid overview={marketOverview.data} />
        <div className="grid gap-4">
          <ModeSelector />
          <TelegramPanel />
          <PortfolioPanel portfolio={portfolios.data?.[0]} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <SignalFeed signals={signalFeed.data} />
        <AssistantChat />
      </div>
    </motion.div>
  );
}

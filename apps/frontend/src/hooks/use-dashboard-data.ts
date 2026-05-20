import { useQuery } from '@tanstack/react-query';

import {
  fetchAgentSummary,
  fetchLatestSignal,
  fetchMarketOverview,
  fetchPortfolios,
  fetchSignalFeed,
} from '@/services/dashboard-service';

export function useDashboardData(symbol: string, timeframe: string) {
  const agentSummary = useQuery({
    queryKey: ['agent-summary'],
    queryFn: fetchAgentSummary,
    refetchInterval: 30_000,
  });

  const marketOverview = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: 15_000,
  });

  const latestSignal = useQuery({
    queryKey: ['latest-signal', symbol, timeframe],
    queryFn: () => fetchLatestSignal(symbol, timeframe),
    refetchInterval: 30_000,
  });

  const signalFeed = useQuery({
    queryKey: ['signal-feed'],
    queryFn: fetchSignalFeed,
    refetchInterval: 30_000,
  });

  const portfolios = useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    refetchInterval: 30_000,
  });

  return { agentSummary, marketOverview, latestSignal, signalFeed, portfolios };
}

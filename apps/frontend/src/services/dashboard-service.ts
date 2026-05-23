import type { AgentSummary, MarketOverview, Portfolio, Signal } from '@ghostfx/shared-types';

import { api } from '@/lib/api';

export async function fetchAgentSummary() {
  const { data } = await api.get<AgentSummary>('/agent/summary');
  return data;
}

export async function fetchMarketOverview() {
  const { data } = await api.get<MarketOverview>('/market/overview');
  return data;
}

export async function fetchLatestSignal(symbol = 'EURUSD', timeframe = 'M15') {
  const { data } = await api.get<Signal>('/signals/latest', { params: { symbol, timeframe } });
  return data;
}

export async function fetchSignalFeed() {
  const { data } = await api.get<Signal[]>('/signals/feed');
  return data;
}

export async function fetchPortfolios() {
  const { data } = await api.get<Portfolio[]>('/portfolios/me');
  return data;
}

export async function askAgent(question: string) {
  const { data } = await api.post<{ answer: string; follow_up: string[] }>('/agent/chat', { question });
  return data;
}

export async function connectTelegram(chatId: string) {
  const { data } = await api.post<{ telegram_connected: boolean }>('/notifications/telegram/connect', { chat_id: chatId });
  return data;
}

export async function updateUser(updates: Partial<{ full_name: string; experience_mode: string; alert_on_buy: boolean; alert_on_sell: boolean; alert_on_hold: boolean }>) {
  const { data } = await api.patch<import('@ghostfx/shared-types').User>('/auth/me', updates);
  return data;
}

export async function testTelegram() {
  const { data } = await api.post<{ sent: boolean }>('/notifications/telegram/test');
  return data;
}

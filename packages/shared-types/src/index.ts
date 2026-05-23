export type ExperienceMode = 'beginner' | 'intermediate' | 'advanced';
export type SignalAction = 'BUY' | 'SELL' | 'WAIT' | 'DO_NOT_TRADE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  experience_mode: ExperienceMode;
  broker_connected: boolean;
  paper_trading_enabled: boolean;
  telegram_connected: boolean;
  alert_on_buy: boolean;
  alert_on_sell: boolean;
  alert_on_hold: boolean;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface MarketQuote {
  symbol: string;
  asset_class: string;
  price: number;
  change_percent: number;
  volatility: number;
  sentiment: string;
}

export interface MarketOverview {
  scan_status: string;
  opportunities: number;
  do_not_trade_count: number;
  strongest_pairs: string[];
  quotes: MarketQuote[];
}

export interface Signal {
  id: string;
  symbol: string;
  asset_class: string;
  timeframe: string;
  action: SignalAction;
  confidence: number;
  risk_level: RiskLevel;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  reasoning: string[];
  indicators: Record<string, number>;
  market_context: Record<string, unknown>;
  agent_summary: string;
  created_at: string;
}

export interface AgentSummary {
  status: string;
  protection_mode: string;
  market_posture: string;
  guidance: string;
  alerts: string[];
  strongest_markets: string[];
  avoid_markets: string[];
}

export interface Portfolio {
  id: string;
  name: string;
  mode: string;
  balance: number;
  equity: number;
  max_daily_loss: number;
  max_risk_per_trade: number;
  stats: Record<string, unknown>;
}

// Stock types

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  market: 'CN' | 'US';
  created_at?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  amount: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
  updated_at: string;
  market: 'CN' | 'US';
}

export interface KLineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  id: number;
  user_id: string;
  stock_id: number;
  stock?: Stock;
  added_at: string;
}

export interface Alert {
  id: number;
  user_id: string;
  stock_id: number;
  stock?: Stock;
  threshold: number;
  condition: 'above' | 'below';
  triggered: boolean;
  triggered_at?: string;
  created_at: string;
}

export interface PriceHistory {
  id: number;
  stock_id: number;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

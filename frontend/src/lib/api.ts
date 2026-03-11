import { StockQuote, KLineData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://stockpulse-api.fly.dev';

// Fallback mock data for demo
const MOCK_STOCKS: StockQuote[] = [
  {
    symbol: '600519',
    name: '贵州茅台',
    price: 1850.0,
    change: 42.5,
    change_percent: 2.35,
    volume: 1234567,
    amount: 2280000000,
    high: 1872.0,
    low: 1805.0,
    open: 1808.0,
    prev_close: 1807.5,
    updated_at: new Date().toISOString(),
    market: 'CN',
  },
  {
    symbol: '000001',
    name: '平安银行',
    price: 12.5,
    change: -0.1,
    change_percent: -0.8,
    volume: 45678901,
    amount: 569000000,
    high: 12.75,
    low: 12.35,
    open: 12.6,
    prev_close: 12.6,
    updated_at: new Date().toISOString(),
    market: 'CN',
  },
  {
    symbol: '600036',
    name: '招商银行',
    price: 38.92,
    change: 0.68,
    change_percent: 1.78,
    volume: 28456789,
    amount: 1105000000,
    high: 39.2,
    low: 38.1,
    open: 38.25,
    prev_close: 38.24,
    updated_at: new Date().toISOString(),
    market: 'CN',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.08,
    change_percent: 1.2,
    volume: 52345678,
    amount: 9180000000,
    high: 176.5,
    low: 173.2,
    open: 173.5,
    prev_close: 173.35,
    updated_at: new Date().toISOString(),
    market: 'US',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 238.52,
    change: -8.65,
    change_percent: -3.5,
    volume: 89234567,
    amount: 21280000000,
    high: 248.0,
    low: 235.1,
    open: 247.2,
    prev_close: 247.17,
    updated_at: new Date().toISOString(),
    market: 'US',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 378.91,
    change: 4.23,
    change_percent: 1.13,
    volume: 18234567,
    amount: 6910000000,
    high: 380.5,
    low: 375.2,
    open: 375.8,
    prev_close: 374.68,
    updated_at: new Date().toISOString(),
    market: 'US',
  },
];

// Generate mock K-line data
function generateMockKLineData(days: number = 100): KLineData[] {
  const data: KLineData[] = [];
  let basePrice = 100;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const volatility = 0.03;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = basePrice;
    const close = basePrice * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(10000000 + Math.random() * 50000000);

    data.push({
      time: Math.floor((now - i * dayMs) / 1000),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    basePrice = close;
  }

  return data;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stock/${symbol}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    // Fallback to mock data
    return MOCK_STOCKS.find(s => s.symbol === symbol) || null;
  }
}

export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    const res = await fetch(`${API_BASE}/api/stocks?symbols=${symbols.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    // Fallback to mock data
    return MOCK_STOCKS.filter(s => symbols.includes(s.symbol));
  }
}

export async function fetchStockHistory(
  symbol: string,
  period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M'
): Promise<KLineData[]> {
  try {
    const res = await fetch(`${API_BASE}/api/stock/${symbol}/history?period=${period}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    // Fallback to mock data
    return generateMockKLineData(period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 365);
  }
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  try {
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    return await res.json();
  } catch {
    // Fallback to mock data
    const q = query.toLowerCase();
    return MOCK_STOCKS.filter(
      s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }
}

export { MOCK_STOCKS };

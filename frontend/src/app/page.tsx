'use client';

import { useState } from 'react';
import { MOCK_STOCKS, searchStocks } from '@/lib/api';
import { StockQuote, KLineData } from '@/types';
import StockCard from '@/components/StockCard';
import SearchBar from '@/components/SearchBar';
import AlertSettings from '@/components/AlertSettings';
import KLineChart from '@/components/KLineChart';

export default function Home() {
  const [stocks, setStocks] = useState<StockQuote[]>(MOCK_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [filter, setFilter] = useState<'all' | 'CN' | 'US'>('all');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState<number[]>([5, 7, 10]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setStocks(MOCK_STOCKS);
      return;
    }
    const results = await searchStocks(query);
    if (results.length > 0) {
      setStocks(results);
    }
  };

  const handleAddStock = (stock: StockQuote) => {
    if (!stocks.find(s => s.symbol === stock.symbol)) {
      setStocks([...stocks, stock]);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setStocks(stocks.filter(s => s.symbol !== symbol));
    if (selectedStock?.symbol === symbol) {
      setSelectedStock(null);
    }
  };

  const handleSelectStock = (stock: StockQuote) => {
    setSelectedStock(stock);
    // Generate mock K-line data for the selected stock
    const data: KLineData[] = [];
    let basePrice = stock.price;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 30; i >= 0; i--) {
      const volatility = 0.03;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const open = basePrice * (1 - change * 0.5);
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
    setKlineData(data);
  };

  const filteredStocks = stocks.filter(stock => {
    if (filter === 'all') return true;
    return stock.market === filter;
  });

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">StockPulse</h1>
            </div>
            <div className="flex items-center gap-4">
              <SearchBar onSelect={handleAddStock} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Market Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            全部
          </button>
          <button 
            onClick={() => setFilter('CN')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'CN' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            A股
          </button>
          <button 
            onClick={() => setFilter('US')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'US' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            美股
          </button>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredStocks.map((stock) => (
            <StockCard 
              key={stock.symbol} 
              stock={stock} 
              onClick={() => handleSelectStock(stock)}
              onRemove={() => handleRemoveStock(stock.symbol)}
              isSelected={selectedStock?.symbol === stock.symbol}
            />
          ))}
        </div>

        {/* K-line Chart */}
        {selectedStock && (
          <div className="mb-6">
            <KLineChart data={klineData} symbol={selectedStock.symbol} />
          </div>
        )}

        {/* Alert Settings */}
        <AlertSettings 
          enabled={alertEnabled} 
          onToggle={() => setAlertEnabled(!alertEnabled)}
          onChange={setAlertThresholds}
        />
      </div>
    </main>
  );
}

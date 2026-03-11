'use client';

import { StockQuote } from '@/types';
import { format } from 'date-fns';

interface StockCardProps {
  stock: StockQuote;
  onClick?: () => void;
  onRemove?: () => void;
  isSelected?: boolean;
}

export default function StockCard({ stock, onClick, onRemove, isSelected }: StockCardProps) {
  const isUp = stock.change_percent >= 0;
  const colorClass = isUp ? 'text-red-500' : 'text-green-500';
  const bgClass = isUp ? 'bg-red-500/10' : 'bg-green-500/10';

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-800/50 hover:bg-slate-800'}
        hover:scale-[1.02] hover:shadow-lg
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-white">{stock.symbol}</h3>
          <p className="text-sm text-slate-400">{stock.name}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
          {stock.market === 'CN' ? 'A股' : '美股'}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold text-white">
          {stock.market === 'CN' ? '¥' : '$'}{stock.price.toFixed(2)}
        </p>
        <div className={`flex items-center gap-2 mt-1 ${colorClass}`}>
          <span className="text-lg font-semibold">
            {isUp ? '+' : ''}{stock.change.toFixed(2)}
          </span>
          <span className={`px-2 py-0.5 rounded text-sm font-medium ${bgClass}`}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div>
          <span className="text-slate-500">成交量</span>
          <p className="text-slate-300">{formatVolume(stock.volume)}</p>
        </div>
        <div>
          <span className="text-slate-500">成交额</span>
          <p className="text-slate-300">{formatAmount(stock.amount)}</p>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="mt-3 w-full py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
        >
          移除自选
        </button>
      )}
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 100000000) return (v / 100000000).toFixed(2) + '亿';
  if (v >= 10000) return (v / 10000).toFixed(2) + '万';
  return v.toString();
}

function formatAmount(a: number): string {
  if (a >= 100000000) return (a / 100000000).toFixed(2) + '亿';
  if (a >= 10000) return (a / 10000).toFixed(2) + '万';
  return a.toString();
}

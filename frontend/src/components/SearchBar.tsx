'use client';

import { useState, useEffect, useRef } from 'react';
import { StockQuote } from '@/types';
import { searchStocks } from '@/lib/api';

interface SearchBarProps {
  onSelect: (stock: StockQuote) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockQuote[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await searchStocks(query);
      setResults(data);
      setLoading(false);
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (stock: StockQuote) => {
    onSelect(stock);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索股票代码或名称..."
          className="w-full px-4 py-2.5 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-medium text-white">{stock.symbol}</span>
                <span className="ml-2 text-slate-400">{stock.name}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                {stock.market === 'CN' ? 'A股' : '美股'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

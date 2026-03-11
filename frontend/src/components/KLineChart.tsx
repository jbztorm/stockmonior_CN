'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, ColorType, CrosshairMode, Time } from 'lightweight-charts';
import { KLineData } from '@/types';

interface KLineChartProps {
  data: KLineData[];
  symbol: string;
  period: '1D' | '1W' | '1M' | '3M' | '1Y';
  onPeriodChange: (period: '1D' | '1W' | '1M' | '3M' | '1Y') => void;
}

export default function KLineChart({ data, symbol, period, onPeriodChange }: KLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#3b82f6',
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#22c55e',
      borderUpColor: '#ef4444',
      borderDownColor: '#22c55e',
      wickUpColor: '#ef4444',
      wickDownColor: '#22c55e',
    });
    candlestickSeriesRef.current = candlestickSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    const candlestickData: CandlestickData<Time>[] = data.map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData: HistogramData<Time>[] = data.map(d => ({
      time: d.time as Time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
    }));

    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  const periods: ('1D' | '1W' | '1M' | '3M' | '1Y')[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">
          {symbol} K线图
        </h3>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

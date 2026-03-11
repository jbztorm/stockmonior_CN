'use client';

import { useState } from 'react';

interface AlertSettingsProps {
  onChange: (thresholds: number[]) => void;
  enabled: boolean;
  onToggle: () => void;
}

export default function AlertSettings({ onChange, enabled, onToggle }: AlertSettingsProps) {
  const [thresholds, setThresholds] = useState<number[]>([5, 7, 10]);

  const toggleThreshold = (value: number) => {
    let newThresholds: number[];
    if (thresholds.includes(value)) {
      newThresholds = thresholds.filter(t => t !== value);
    } else {
      newThresholds = [...thresholds, value].sort((a, b) => a - b);
    }
    setThresholds(newThresholds);
    onChange(newThresholds);
  };

  const alertOptions = [5, 7, 10, 15, 20];

  return (
    <div className="bg-slate-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">涨跌幅预警</h3>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex flex-wrap gap-2">
          {alertOptions.map((value) => (
            <button
              key={value}
              onClick={() => toggleThreshold(value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                thresholds.includes(value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ±{value}%
            </button>
          ))}
        </div>
      )}

      {enabled && thresholds.length === 0 && (
        <p className="text-sm text-yellow-500 mt-2">
          请至少选择一个预警阈值
        </p>
      )}
    </div>
  );
}

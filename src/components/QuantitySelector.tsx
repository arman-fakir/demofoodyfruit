import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { toBengaliNumber } from '../lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const buttonClass = isSm
    ? 'w-7 h-7 text-xs'
    : size === 'lg'
    ? 'w-10 h-10 text-base'
    : 'w-8 h-8 text-sm';

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${buttonClass} flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        aria-label="পরিমাণ কমান"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        className={`px-3 font-semibold text-slate-800 tabular-nums text-center ${
          isSm ? 'text-xs min-w-[28px]' : 'text-sm min-w-[36px]'
        }`}
      >
        {toBengaliNumber(quantity)}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${buttonClass} flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
        aria-label="পরিমাণ বাড়ান"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

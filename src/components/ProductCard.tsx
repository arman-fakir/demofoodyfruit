import React from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types/product';
import { formatCurrencyBn } from '../lib/utils';
import { QuantitySelector } from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  currentQuantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onInstantOrder: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentQuantity,
  onUpdateQuantity,
  onInstantOrder,
}) => {
  const handleIncrease = () => {
    onUpdateQuantity(product.id, currentQuantity + 1);
  };

  const handleDecrease = () => {
    if (currentQuantity > 0) {
      onUpdateQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleOrderClick = () => {
    onInstantOrder(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container with fallback container */}
      <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={`${product.title} - Foody Rahat ফ্রেশ জুস`}
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quiet badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-800 bg-white/95 backdrop-blur-md rounded-md shadow-2xs border border-slate-100">
            {product.badge}
          </span>
        </div>

        {/* Bottle volume indicator */}
        <div className="absolute top-3 right-3">
          <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-white/90 backdrop-blur-xs rounded-md">
            {product.unit}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                {product.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{product.englishTitle}</p>
            </div>
            {/* Price */}
            <div className="text-right shrink-0">
              <span className="text-xl font-bold text-emerald-700 tabular-nums">
                {formatCurrencyBn(product.price)}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {product.caloriesEstimate && (
            <p className="mt-1 text-[11px] text-slate-400">
              আনুমানিক: {product.caloriesEstimate} · ১০০% খাঁটি
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center gap-1.5">
            <QuantitySelector
              quantity={currentQuantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              min={0}
              size="sm"
            />
          </div>

          {/* Add to cart without leaving the product grid, so multiple products can be selected. */}
          <button
            type="button"
            onClick={handleOrderClick}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              currentQuantity > 0
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
            }`}
          >
            {currentQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>কার্টে আছে</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্টে যোগ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

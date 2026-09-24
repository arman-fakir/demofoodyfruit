import React from 'react';
import { PRODUCTS } from '../config/products';
import { ProductCard } from './ProductCard';
import { CartItem } from '../types/product';

interface ProductGridProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onInstantOrder: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  cartItems,
  onUpdateQuantity,
  onInstantOrder,
}) => {
  const getQuantityForProduct = (productId: string) => {
    const item = (cartItems || []).find((ci) => ci?.product?.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section id="products-section" className="py-12 sm:py-16 lg:py-20 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
            ফ্রেশ কালেকশন
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            আপনার পছন্দের ফ্রেশ জুস
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            তাজা ফলের স্বাদে প্রতিদিনকে করুন আরও সতেজ। সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে প্রস্তুতকৃত প্রাকৃতিক জুস।
          </p>
        </div>

        {/* Product Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(PRODUCTS || []).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currentQuantity={getQuantityForProduct(product.id)}
              onUpdateQuantity={onUpdateQuantity}
              onInstantOrder={onInstantOrder}
            />
          ))}
        </div>

        {/* Assurance footer below grid */}
        <div className="mt-10 p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>অর্ডার কনফার্ম করার পরেই তাজা ফল দিয়ে ব্লেন্ড করা হয়। কোনো কৃত্রিম সংরক্ষণকারী নেই।</span>
          </div>
          <span className="font-semibold text-emerald-800 shrink-0">
            ক্যাশ অন ডেলিভারি (COD) উপলব্ধ
          </span>
        </div>
      </div>
    </section>
  );
};

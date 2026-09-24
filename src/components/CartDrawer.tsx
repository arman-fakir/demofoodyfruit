import React from 'react';
import { ArrowRight, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem } from '../types/product';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';
import { QuantitySelector } from './QuantitySelector';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, items, totalAmount, onClose, onUpdateQuantity, onRemoveItem, onCheckout,
}) => {
  if (!isOpen) return null;
  const activeItems = items.filter((item) => item.quantity > 0);
  const totalCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-60" role="dialog" aria-modal="true" aria-label="আপনার কার্ট">
      <button onClick={onClose} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] cursor-default" aria-label="কার্ট বন্ধ করুন" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-fade-in">
        <header className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
            <div><h2 className="font-bold text-slate-900">আপনার কার্ট</h2><p className="text-xs text-slate-500">{toBengaliNumber(totalCount)} টি জুস সিলেক্ট করা হয়েছে</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer" aria-label="বন্ধ করুন"><X className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {activeItems.length === 0 ? (
            <div className="h-full min-h-60 flex flex-col items-center justify-center text-center text-slate-500">
              <ShoppingBag className="w-10 h-10 text-slate-300 mb-3" /><p className="font-semibold">কার্ট এখনো খালি</p><p className="text-xs mt-1">পছন্দের জুসগুলো কার্টে যোগ করুন।</p>
            </div>
          ) : <div className="space-y-4">{activeItems.map((item) => (
            <div key={item.product.id} className="flex gap-3 pb-4 border-b border-slate-100">
              <img src={item.product.image} alt={item.product.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              <div className="flex-1 min-w-0"><p className="font-bold text-sm text-slate-900 truncate">{item.product.title}</p><p className="text-xs text-emerald-700 font-semibold mt-0.5">{formatCurrencyBn(item.product.price)}</p>
                <div className="mt-2 flex items-center justify-between gap-2"><QuantitySelector quantity={item.quantity} min={1} size="sm" onIncrease={() => onUpdateQuantity(item.product.id, item.quantity + 1)} onDecrease={() => onUpdateQuantity(item.product.id, item.quantity - 1)} />
                  <div className="flex items-center gap-2"><span className="font-bold text-sm">{formatCurrencyBn(item.product.price * item.quantity)}</span><button onClick={() => onRemoveItem(item.product.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer" aria-label="পণ্য মুছুন"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              </div>
            </div>
          ))}</div>}
        </div>

        <footer className="p-5 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-4"><span className="font-semibold text-slate-700">পণ্যের মোট</span><span className="text-xl font-bold text-emerald-700">{formatCurrencyBn(totalAmount)}</span></div>
          <button disabled={!activeItems.length} onClick={onCheckout} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">চেকআউটে যান <ArrowRight className="w-4 h-4" /></button>
        </footer>
      </aside>
    </div>
  );
};

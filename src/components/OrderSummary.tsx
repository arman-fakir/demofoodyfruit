import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem } from '../types/product';
import { DeliveryArea } from '../types/order';
import { BUSINESS_CONFIG } from '../config/business';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';
import { QuantitySelector } from './QuantitySelector';

interface OrderSummaryProps {
  items: CartItem[];
  deliveryArea: DeliveryArea;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  deliveryArea,
  subtotal,
  deliveryCharge,
  grandTotal,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const activeItems = (items || []).filter((item) => item && item.quantity > 0 && item.product);

  return (
    <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h3 className="text-base font-bold text-slate-900">
          অর্ডার সামারি ({toBengaliNumber(activeItems.length)}টি আইটেম)
        </h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
          ক্যাশ অন ডেলিভারি (COD)
        </span>
      </div>

      {/* Selected Products List */}
      {activeItems.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          <p>আপনার কার্টে এখনও কোনো ফ্রেশ জুস যোগ করা হয়নি।</p>
          <p className="text-xs text-slate-400 mt-1">
            উপরে ফ্লেভার সেকশন থেকে আপনার পছন্দের জুস সিলেক্ট করুন।
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200/70 max-h-80 overflow-y-auto pr-1 my-3">
          {activeItems.map((item) => {
            if (!item?.product) return null;
            const itemTotal = (item.product.price || 0) * item.quantity;
            return (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.product.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrencyBn(item.product.price)} / {item.product.unit}
                    </p>
                  </div>
                </div>

                {/* Stepper + Item Price + Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    onDecrease={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    min={1}
                    size="sm"
                  />

                  <span className="text-sm font-bold text-slate-900 min-w-[60px] text-right tabular-nums">
                    {formatCurrencyBn(itemTotal)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    title="মুছে ফেলুন"
                    aria-label={`${item.product.title} মুছে ফেলুন`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calculations Breakdown */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>সাবটোটাল (পণ্য মূল্য)</span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrencyBn(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>ডেলিভারি চার্জ</span>
            <span className="text-xs text-slate-400">
              ({deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})
            </span>
          </div>
          <span className="font-semibold text-slate-900 tabular-nums">
            {formatCurrencyBn(deliveryCharge)}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between text-base">
          <span className="font-bold text-slate-900">সর্বমোট প্রদেয়</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">
              {formatCurrencyBn(grandTotal)}
            </span>
            <p className="text-[11px] text-slate-400">
              পণ্য হাতে পেয়ে টাকা পরিশোধ করুন ({BUSINESS_CONFIG.currencyCode})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

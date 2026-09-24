import React from 'react';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';
import { getWhatsAppInquiryUrl } from '../lib/whatsapp';
import { BUSINESS_CONFIG } from '../config/business';

interface MobileOrderBarProps {
  totalItemsCount: number;
  totalAmount: number;
  onOpenCart: () => void;
}

export const MobileOrderBar: React.FC<MobileOrderBarProps> = ({
  totalItemsCount,
  totalAmount,
  onOpenCart,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-3 py-2.5 max-h-[72px]">
      <div className="flex items-center justify-between gap-2.5">
        {/* Cart status summary or brand callout */}
        <div className="min-w-0">
          {totalItemsCount > 0 ? (
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                {toBengaliNumber(totalItemsCount)}টি জুস সিলেক্টেড
              </div>
              <div className="text-base font-bold text-emerald-700 tabular-nums leading-tight">
                {formatCurrencyBn(totalAmount)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={BUSINESS_CONFIG.logo}
                alt="Foody Rahat"
                className="w-8 h-8 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="truncate">
                <div className="text-[11px] font-semibold text-emerald-700 truncate">
                  Foody Rahat জুস
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  কল: {BUSINESS_CONFIG.phone}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getWhatsAppInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 active:bg-emerald-100 transition-colors"
            aria-label="WhatsApp-এ অর্ডার করুন"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 active:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কার্ট দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

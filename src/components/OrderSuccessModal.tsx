import React, { useEffect } from 'react';
import { CheckCircle2, MessageCircle, RotateCcw, Copy, Check, MapPin, Phone, User, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderRecord } from '../types/order';
import { BUSINESS_CONFIG } from '../config/business';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';
import { getWhatsAppOrderUrl } from '../lib/whatsapp';
import { CartItem } from '../types/product';

interface OrderSuccessModalProps {
  order: OrderRecord;
  cartItemsSnapshot: CartItem[];
  onResetOrder: () => void;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  cartItemsSnapshot,
  onResetOrder,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire festive celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#16A34A', '#F97316', '#DB2777', '#EAB308'],
      });
    } catch {
      // ignore
    }
  }, []);

  const whatsAppUrl = getWhatsAppOrderUrl({
    orderId: order.id,
    orderItems: (order?.items || []).map((it) => ({
      productTitle: it.productTitle,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
    formData: {
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      deliveryArea: order.deliveryArea,
      specialNotes: order.specialNotes,
    },
    deliveryArea: order.deliveryArea,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    grandTotal: order.grandTotal,
  });

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Success Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={BUSINESS_CONFIG.logo}
            alt="Foody Rahat"
            className="w-14 h-14 rounded-full object-cover shadow-md border border-emerald-200"
            referrerPolicy="no-referrer"
          />
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5 mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
          </h3>
          <p className="text-sm text-slate-600">
            আপনার অর্ডারটি আমরা পেয়েছি। আমাদের প্রতিনিধি খুব শীঘ্রই ফোন করে অর্ডার কনফার্ম করবেন।
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-500 font-mono">অর্ডার আইডি:</span>
            <span className="text-sm font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {order.id}
            </span>
            <button
              onClick={handleCopyOrderId}
              className="text-xs text-emerald-700 hover:text-emerald-800 p-1"
              title="অর্ডার আইডি কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Receipt Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-semibold border-b border-slate-200 pb-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>অর্ডারের সারসংক্ষেপ</span>
          </div>

          <div className="space-y-1.5 divide-y divide-slate-200/60">
            {(order?.items || []).map((item, idx) => (
              <div key={idx} className="pt-1.5 first:pt-0 flex justify-between">
                <span className="text-slate-700">
                  {item.productTitle || item.productId} × {toBengaliNumber(item.quantity || 1)}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrencyBn(item.subtotal || (item.unitPrice || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি এলাকা:</span>
              <span className="font-medium text-slate-800">{order.deliveryAreaLabel}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-medium text-slate-800">{formatCurrencyBn(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="text-emerald-700">{formatCurrencyBn(order.grandTotal)} (COD)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{order.address}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-md transition-all text-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp-এ অর্ডারের তথ্য পাঠান</span>
          </a>

          {onTrackOrder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onTrackOrder(order.id);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>এই অর্ডারের লাইভ ট্র্যাকিং দেখুন (#{order.id})</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                onResetOrder();
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার অর্ডার করুন</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

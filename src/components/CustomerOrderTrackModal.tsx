import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { trackOrderPublic } from '../lib/orderService';
import { BUSINESS_CONFIG } from '../config/business';
import { toBengaliNumber } from '../lib/utils';

interface CustomerOrderTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const CustomerOrderTrackModal: React.FC<CustomerOrderTrackModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<{
    id: string;
    customerName: string;
    maskedPhone?: string;
    deliveryAreaLabel: string;
    items: Array<{
      productTitle: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    subtotal: number;
    deliveryCharge: number;
    grandTotal: number;
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
  } | null>(null);

  // Initialize or track when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      const targetId = initialOrderId || 'FR-73004143';
      setSearchQuery(targetId);
      performSearch(targetId);
    }
  }, [isOpen, initialOrderId]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setErrorMsg('অনুগ্রহ করে অর্ডার আইডি অথবা মোবাইল নম্বর লিখুন');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await trackOrderPublic(query);
      if (res.success && res.order) {
        setTrackedOrder(res.order);
      } else {
        setTrackedOrder(null);
        setErrorMsg(res.message || 'এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। সঠিক আইডি দিন।');
      }
    } catch {
      setErrorMsg('সার্ভারে যোগাযোগ করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  if (!isOpen) return null;

  // Timeline step active states
  const getStepActive = (step: number, status: string) => {
    if (status === 'CANCELLED') return false;
    switch (step) {
      case 1: // Confirmed
        return ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED'].includes(status);
      case 2: // Processing
        return ['PROCESSING', 'DELIVERED'].includes(status);
      case 3: // Out for delivery
        return ['DELIVERED'].includes(status);
      case 4: // Delivered
        return status === 'DELIVERED';
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/30 border border-emerald-400/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif">আপনার অর্ডার ট্র্যাক করুন</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  গ্রাহক ট্র্যাকিং
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                অর্ডার আইডি দিয়ে আপনার ফ্রেশ জুসের ডেলিভারি আপডেট জানুন
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              অর্ডার আইডি অথবা ফোন নম্বর দিন
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="যেমন: FR-73004143 বা আপনার মোবাইল নম্বর"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>খুঁজুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span>টেস্ট করতে ক্লিক করুন:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('FR-73004143');
                  performSearch('FR-73004143');
                }}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-medium border border-emerald-200 transition-colors"
              >
                FR-73004143
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('FR-01025469');
                  performSearch('FR-01025469');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium border border-slate-200 transition-colors"
              >
                FR-01025469
              </button>
            </div>
          </form>

          {/* Error display */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-xs text-rose-600 mt-1">
                  কোনো সমস্যা হলে সরাসরি আমাদের হটলাইনে ফোন দিন: {BUSINESS_CONFIG.phone}
                </p>
              </div>
            </div>
          )}

          {/* Tracked Order Details */}
          {trackedOrder && (
            <div className="space-y-6 animate-fade-in">
              {/* Order Status Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-emerald-300 font-medium">অর্ডার ট্র্যাকিং আইডি</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                        #{trackedOrder.id}
                      </h4>
                      <button
                        onClick={() => handleCopyId(trackedOrder.id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors text-xs flex items-center gap-1"
                        title="আইডি কপি করুন"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        trackedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : trackedOrder.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {trackedOrder.status === 'DELIVERED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {trackedOrder.status === 'DELIVERED'
                        ? 'ডেলিভারি সম্পন্ন'
                        : trackedOrder.status === 'PROCESSING'
                        ? 'জুস তৈরি ও প্যাকিং'
                        : trackedOrder.status === 'CANCELLED'
                        ? 'অর্ডার বাতিল'
                        : 'অর্ডার গৃহীত হয়েছে'}
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      মোট প্রদেয় বিল: <span className="font-bold text-white text-sm">৳{toBengaliNumber(trackedOrder.grandTotal)}</span>
                    </p>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="pt-4">
                  <p className="text-xs text-slate-300 mb-3 font-semibold">ডেলিভারি প্রোগ্রেস:</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        getStepActive(1, trackedOrder.status)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      </div>
                      অর্ডার গৃহীত
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        getStepActive(2, trackedOrder.status)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <Package className="w-4 h-4 text-emerald-300" />
                      </div>
                      ফ্রেশ জুস তৈরি
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        getStepActive(4, trackedOrder.status)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-emerald-300" />
                      </div>
                      ডেলিভারি সম্পন্ন
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    অর্ডারকৃত আইটেমসমূহ
                  </h4>
                  <span className="text-xs text-slate-500">
                    এলাকা: <span className="font-semibold text-slate-700">{trackedOrder.deliveryAreaLabel}</span>
                  </span>
                </div>

                <div className="divide-y divide-slate-200/80 bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {(trackedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{item.productTitle}</p>
                          <p className="text-xs text-slate-500">
                            ৳{toBengaliNumber(item.unitPrice)} × {toBengaliNumber(item.quantity)} বোতল
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">
                        ৳{toBengaliNumber(item.subtotal || item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 pt-2 text-sm">
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>আইটেম সাবটোটাল</span>
                    <span>৳{toBengaliNumber(trackedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>ডেলিভারি চার্জ</span>
                    <span>৳{toBengaliNumber(trackedOrder.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200">
                    <span>সর্বমোট প্রদেয় (ক্যাশ অন ডেলিভারি)</span>
                    <span className="text-emerald-700 text-base">৳{toBengaliNumber(trackedOrder.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Assistance Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">জরুরি ডেলিভারি তথ্য বা সহায়তা প্রয়োজন?</p>
                    <p className="text-sm font-bold">{BUSINESS_CONFIG.phone} (সরাসরি কল বা হোয়াটসঅ্যাপ)</p>
                  </div>
                </div>

                <a
                  href={`tel:${BUSINESS_CONFIG.phone}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>কল করুন</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% প্রিজারভেটিভমুক্ত ন্যাচারাল কোল্ড প্রেসড ফ্রেশ জুস</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

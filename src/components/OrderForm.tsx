import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, AlertCircle, CheckCircle2, ShieldCheck, MapPin, Truck, X } from 'lucide-react';
import { CartItem, Product } from '../types/product';
import { OrderFormData, DeliveryArea, OrderRecord } from '../types/order';
import { BUSINESS_CONFIG } from '../config/business';
import { PRODUCTS } from '../config/products';
import { OrderSummary } from './OrderSummary';
import { getWhatsAppOrderUrl } from '../lib/whatsapp';
import { validateOrder } from '../lib/validation';
import { submitOrder } from '../lib/orderService';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';

interface OrderFormProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: OrderRecord) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  isOpen = true,
  onClose,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    phone: '',
    address: '',
    deliveryArea: 'inside_dhaka',
    specialNotes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Dynamic calculations strictly from config
  const subtotal = (cartItems || []).reduce(
    (acc, item) => acc + (item?.product?.price || 0) * (item?.quantity || 0),
    0
  );

  const deliveryCharge =
    formData.deliveryArea === 'inside_dhaka'
      ? BUSINESS_CONFIG.deliveryCharges.insideDhaka
      : BUSINESS_CONFIG.deliveryCharges.outsideDhaka;

  const grandTotal = subtotal > 0 ? subtotal + deliveryCharge : 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleAreaChange = (area: DeliveryArea) => {
    setFormData((prev) => ({ ...prev, deliveryArea: area }));
  };

  // Add a product directly from the checkout form flavor pills if needed
  const handleQuickAddProduct = (product: Product) => {
    const existing = (cartItems || []).find((item) => item?.product?.id === product.id);
    onUpdateQuantity(product.id, existing ? existing.quantity + 1 : 1);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const activeList = (cartItems || []).filter((item) => item && item.quantity > 0 && item.product);

    const validation = validateOrder(formData, activeList);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitOrder(
        formData,
        activeList.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      );

      if (response.success && response.order) {
        onOrderSuccess(response.order);
        setFormData({
          customerName: '',
          phone: '',
          address: '',
          deliveryArea: 'inside_dhaka',
          specialNotes: '',
        });
        setFormErrors({});
      } else {
        setServerError(response.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch {
      setServerError('নেটওয়ার্কে সমস্যা দেখা দিয়েছে। আপনি চাইলে সরাসরি WhatsApp-এ অর্ডার করতে পারেন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle direct WhatsApp order click
  const handleWhatsAppOrderClick = () => {
    // Validate minimal cart presence
    const activeItems = (cartItems || []).filter((item) => item && item.quantity > 0 && item.product);
    if (activeItems.length === 0) {
      setFormErrors({ items: 'WhatsApp-এ পাঠাতে অনুগ্রহ করে কমপক্ষে একটি ফ্রেশ জুস যোগ করুন।' });
      return;
    }

    const whatsAppUrl = getWhatsAppOrderUrl({
      items: activeItems,
      formData,
      deliveryArea: formData.deliveryArea,
      subtotal,
      deliveryCharge,
      grandTotal,
    });

    try {
      const link = document.createElement('a');
      link.href = whatsAppUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = whatsAppUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <section id="order-section" className="fixed inset-0 z-60 overflow-y-auto bg-slate-50">
      <div className="min-h-full">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ShoppingBag className="w-4 h-4" /></div>
              <div><p className="font-bold text-slate-900 leading-tight">নিরাপদ চেকআউট</p><p className="text-[11px] text-slate-500">ক্যাশ অন ডেলিভারি · কোনো অগ্রিম পেমেন্ট নয়</p></div>
            </div>
            {onClose && <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-700 cursor-pointer" aria-label="কার্টে ফিরে যান"><X className="w-4 h-4" /><span>কার্টে ফিরে যান</span></button>}
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
            সহজ ও নিরাপদ অর্ডার
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            আজই আপনার জুস অর্ডার করুন
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            ক্যাশ অন ডেলিভারি (COD) সুবিধায় মাত্র ১ মিনিটে অর্ডার কনফার্ম করুন।
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="flex-1">{serverError}</div>
          </div>
        )}

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Order Form Inputs */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  ১
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  আপনার ডেলিভারি তথ্য দিন
                </h3>
              </div>

              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="যেমন: মোঃ তানভীর আহমেদ"
                  className={`w-full px-4 py-3 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    formErrors.customerName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                  aria-invalid={Boolean(formErrors.customerName)}
                />
                {formErrors.customerName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {formErrors.customerName}
                  </p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="যেমন: 01571509532"
                  className={`w-full px-4 py-3 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    formErrors.phone
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                  aria-invalid={Boolean(formErrors.phone)}
                />
                {formErrors.phone ? (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.phone}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    অর্ডার কনফার্ম করার জন্য এই নম্বরে কল করা হবে।
                  </p>
                )}
              </div>

              {/* Delivery Area Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                  ডেলিভারি এলাকা <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAreaChange('inside_dhaka')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      formData.deliveryArea === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">ঢাকার ভেতরে</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {BUSINESS_CONFIG.deliveryTimeEstimate.insideDhaka}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatCurrencyBn(BUSINESS_CONFIG.deliveryCharges.insideDhaka)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAreaChange('outside_dhaka')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      formData.deliveryArea === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">ঢাকার বাইরে</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {BUSINESS_CONFIG.deliveryTimeEstimate.outsideDhaka}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatCurrencyBn(BUSINESS_CONFIG.deliveryCharges.outsideDhaka)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Delivery Full Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
                >
                  সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ধানমন্ডি ২৭, ঢাকা"
                  className={`w-full px-4 py-3 rounded-xl text-sm border bg-white focus:outline-none focus:ring-2 transition-colors ${
                    formErrors.address
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                  aria-invalid={Boolean(formErrors.address)}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Special Notes (Optional) */}
              <div>
                <label
                  htmlFor="specialNotes"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  id="specialNotes"
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  placeholder="যেমন: বরফ ছাড়া পাঠাবেন / কলিং বেল নষ্ট"
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Quick Flavor Add Pills */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  কার্টে দ্রুত ফ্লেভার যোগ করুন:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(PRODUCTS || []).map((p) => {
                    const isSelected = (cartItems || []).some(
                      (item) => item?.product?.id === p.id && item.quantity > 0
                    );
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleQuickAddProduct(p)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        + {p.title} ({formatCurrencyBn(p.price)})
                      </button>
                    );
                  })}
                </div>
                {formErrors.items && (
                  <p className="mt-2 text-xs text-rose-600 font-medium">
                    {formErrors.items}
                  </p>
                )}
              </div>

              {/* Primary & Secondary Submit CTAs */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>অর্ডার প্রক্রিয়াধীন...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppOrderClick}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-emerald-900 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp-এর মাধ্যমে অর্ডার করুন ({BUSINESS_CONFIG.whatsappNumber})</span>
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>নিরাপদ ও নির্ভরযোগ্য সেবা · কোনো অগ্রিম পেমেন্ট নেই</span>
              </div>
            </form>
          </div>

          {/* Right Column: Dynamic Order Summary */}
          <div className="lg:col-span-5 sticky top-24">
            <OrderSummary
              items={cartItems}
              deliveryArea={formData.deliveryArea}
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              grandTotal={grandTotal}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />

            {/* Quick Guarantees Card */}
            <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>ডেলিভারি সময়:</strong> {formData.deliveryArea === 'inside_dhaka' ? BUSINESS_CONFIG.deliveryTimeEstimate.insideDhaka : BUSINESS_CONFIG.deliveryTimeEstimate.outsideDhaka}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>হাইজিন গ্যারান্টি:</strong> প্রতিটি বোতল সম্পূর্ণ সিল করা অবস্থায় এবং ঠান্ডা অবস্থায় ডেলিভারি করা হয়।
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

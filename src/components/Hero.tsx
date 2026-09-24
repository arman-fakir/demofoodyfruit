import React from 'react';
import { Sparkles, ShieldCheck, HeartPulse, ArrowRight, MessageCircle } from 'lucide-react';
import { HERO_IMAGE } from '../config/products';
import { BUSINESS_CONFIG } from '../config/business';
import { scrollToSection } from '../lib/utils';
import { getWhatsAppInquiryUrl } from '../lib/whatsapp';

export const Hero: React.FC = () => {
  return (
    <section
      id="hero-section"
      className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-20 bg-linear-to-b from-emerald-50/60 via-white to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Bengali Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Brand Logo & Kicker Header */}
            <div className="flex items-center gap-3.5">
              <img
                src={BUSINESS_CONFIG.logo}
                alt="Foody Rahat Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-emerald-500/20 object-cover shrink-0 hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>{BUSINESS_CONFIG.taglines.primary}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  অফিসিয়াল হটলাইন ও WhatsApp: <span className="font-bold text-slate-700">{BUSINESS_CONFIG.phone}</span>
                </p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2] text-balance">
              এক চুমুকেই আসল ফলের সতেজতা!
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              কোনো আর্টিফিশিয়াল কালার বা প্রিজারভেটিভ ছাড়া তৈরি ১০০% খাঁটি ফ্রেশ জুস। সরাসরি বাছাইকৃত সতেজ ফল থেকে প্রস্তুতকৃত পুষ্টিকর ডিটক্স ও জুস আপনার দোরগোড়ায়।
            </p>

            {/* Trust Badges - Unboxed clean layout with separators */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-slate-700 pt-1 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০০% প্রাকৃতিক</span>
              </div>
              <span className="text-slate-300 font-bold" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>নো প্রিজারভেটিভ</span>
              </div>
              <span className="text-slate-300 font-bold" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>স্বাস্থ্যকর ও পুষ্টিকর</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => scrollToSection('order-section')}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
              >
                <span>এখনই জুস অর্ডার করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection('products-section')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                <span>ফ্লেভারসমূহ দেখুন</span>
              </button>

              <a
                href={getWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex sm:hidden items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp-এ সরাসরি কথা বলুন</span>
              </a>
            </div>

            {/* Delivery Assurance Line */}
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ঢাকায় এক্সপ্রেস হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ</span>
            </div>
          </div>

          {/* Right Column: Hero Visual composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative subtle backdrop aura */}
              <div className="absolute -inset-2 rounded-3xl bg-linear-to-tr from-emerald-200/40 via-amber-100/40 to-pink-200/30 blur-xl opacity-70"></div>

              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white">
                {/* Floating Official Brand Badge */}
                <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
                  <img
                    src={BUSINESS_CONFIG.logo}
                    alt="Foody Rahat"
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-slate-800">Foody Rahat ফ্রেশ জুস</span>
                </div>

                <img
                  src={HERO_IMAGE}
                  alt="Foody Rahat ফ্রেশ জুস বোতল ও তাজা ফলের কালেকশন"
                  className="w-full h-auto aspect-4/3 sm:aspect-16/9 lg:aspect-4/3 object-cover transform hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-950/85 via-slate-900/40 to-transparent p-4 text-white">
                  <p className="text-xs font-semibold text-amber-300">১০০% কোল্ড প্রেস্ড রিফ্রেশমেন্ট</p>
                  <p className="text-sm font-medium">প্রতিটি বোতল তৈরি হয় সম্পূর্ণ খাঁটি ফলের নির্যাস দিয়ে</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

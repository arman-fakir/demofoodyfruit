import React from 'react';
import { Facebook, ExternalLink, ThumbsUp } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';

export const FacebookCTA: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-linear-to-r from-blue-900 via-slate-900 to-emerald-950 p-6 sm:p-10 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Decorative subtle aura */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left z-10">
            <img
              src={BUSINESS_CONFIG.logo}
              alt="Foody Rahat"
              className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>সোশ্যাল মিডিয়া আপডেট</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {BUSINESS_CONFIG.brandName}-এর সাথে যুক্ত থাকুন
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                নতুন নতুন ফ্লেভার, সিজনাল ডিসকাউন্ট ও অফার জানতে আমাদের অফিসিয়াল ফেসবুক পেজে ফলো করুন। হটলাইন: <span className="font-semibold text-white">{BUSINESS_CONFIG.phone}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 z-10">
            <a
              href={BUSINESS_CONFIG.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg transition-all"
            >
              <Facebook className="w-5 h-5 fill-current" />
              <span>Facebook Page দেখুন</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

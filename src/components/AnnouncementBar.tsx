import React from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { scrollToSection } from '../lib/utils';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-emerald-950 text-white text-xs sm:text-sm py-2 px-4 relative z-40 border-b border-emerald-900">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left announcement text */}
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="inline-block animate-pulse text-amber-400">🔥</span>
          <span className="truncate">
            ১০০% প্রাকৃতিক ও খাঁটি ফ্রেশ জুস — হোম ডেলিভারি সুবিধা রয়েছে!
          </span>
        </div>

        {/* Right contact and order button */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="hidden sm:inline-flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>কল: {BUSINESS_CONFIG.phone}</span>
          </a>
          <button
            onClick={() => scrollToSection('order-section')}
            className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-white transition-colors underline underline-offset-2"
          >
            <span>অর্ডার করুন</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

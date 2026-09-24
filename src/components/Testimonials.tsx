import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../config/testimonials';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const list = Array.isArray(TESTIMONIALS) ? TESTIMONIALS : [];
  const count = list.length;

  const handlePrev = () => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  const handleNext = () => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
  };

  const current = count > 0 ? list[currentIndex % count] : null;

  if (!current) {
    return null;
  }

  return (
    <section id="reviews-section" className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
            গ্রাহক সন্তুষ্টি
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            আমাদের ফ্রেশ জুস সম্পর্কে গ্রাহকদের অভিজ্ঞতা
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            (উন্নয়নকালে প্রদর্শিত রিভিউ মডেল — config/testimonials.ts থেকে পরিবর্তনযোগ্য)
          </p>
        </div>

        {/* Testimonial Card with simple transition */}
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <Quote className="w-10 h-10 text-emerald-200 absolute top-6 right-6 pointer-events-none" />

          <div className="flex items-center gap-1 text-amber-400 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < current.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
            <span className="ml-2 text-xs font-semibold text-slate-600">৫.০ / ৫.০</span>
          </div>

          <p className="text-base sm:text-lg text-slate-700 italic leading-relaxed mb-6">
            "{current.comment}"
          </p>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {current.customerName}
              </h3>
              <p className="text-xs text-slate-500">
                {current.location} · পছন্দ: <span className="text-emerald-700 font-medium">{current.favoriteFlavor}</span>
              </p>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="পূর্ববর্তী রিভিউ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="পরবর্তী রিভিউ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

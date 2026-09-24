import React from 'react';
import { Award, Ban, Citrus, Truck } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Award,
      title: '১০০% খাঁটি',
      description: 'প্রফেশনাল হাইজিন ও স্বাস্থ্য সুরক্ষা বিধি শতভাগ মেনে প্রস্তুত করা হয়।',
      accent: 'emerald',
    },
    {
      icon: Ban,
      title: 'নো প্রিজারভেটিভ',
      description: 'অপ্রয়োজনীয় কেমিক্যাল বা কৃত্রিম রঙের ব্যবহার থেকে সম্পূর্ণ মুক্ত।',
      accent: 'pink',
    },
    {
      icon: Citrus,
      title: 'তাজা ফলের স্বাদ',
      description: 'সরাসরি ফ্রেশ ও প্রিমিয়াম গ্রেডের তাজা ফলের নির্ভেজাল পুষ্টি ও স্বাদ।',
      accent: 'orange',
    },
    {
      icon: Truck,
      title: 'দ্রুত ডেলিভারি',
      description: 'দ্রুত ও সুবিধাজনক হোম ডেলিভারি এবং ক্যাশ অন ডেলিভারি (COD) পেমেন্ট।',
      accent: 'yellow',
    },
  ];

  return (
    <section id="why-us-section" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
            আমাদের বৈশিষ্ট্য
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            কেন ফুডি রাহাত (Foody Rahat) বেছে নেবেন?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            আমরা নিশ্চিত করি স্বাস্থ্যকর জীবনের জন্য সেরা মানের ফ্রেশ ফলের খাঁটি নির্যাস।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-sm hover:border-emerald-200 transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

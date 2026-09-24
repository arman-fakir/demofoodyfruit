import React, { useState } from 'react';
import { Phone, MessageCircle, Facebook, Heart, ShieldAlert, Package } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { scrollToSection } from '../lib/utils';
import { getWhatsAppInquiryUrl } from '../lib/whatsapp';

interface FooterProps {
  onOpenCustomerTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCustomerTracking,
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer id="contact-section" className="bg-slate-950 text-slate-300 pt-12 pb-24 sm:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <img
                src={BUSINESS_CONFIG.logo}
                alt="Foody Rahat Logo"
                className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">
                  {BUSINESS_CONFIG.brandName}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  হটলাইন: {BUSINESS_CONFIG.phone}
                </span>
              </div>
            </div>
            <p className="text-sm text-emerald-400 font-medium">
              "{BUSINESS_CONFIG.taglines.primary}"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              কোনো প্রিজারভেটিভ বা ক্ষতিকারক কেমিক্যাল ছাড়া তৈরি ১০০% খাঁটি ফ্রেশ ফলের জুস। স্বাস্থ্যকর জীবনের জন্য এক অনন্য রিফ্রেশমেন্ট।
            </p>
            <p className="text-xs text-slate-500">
              {BUSINESS_CONFIG.physicalAddressPlaceholder}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              ন্যাভিগেশন
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('hero-section')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  হোম
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('products-section')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  জুস ফ্লেভারসমূহ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('why-us-section')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  কেন Foody Rahat
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('order-section')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  অনলাইন অর্ডার (COD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('reviews-section')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  গ্রাহক রিভিউ
                </button>
              </li>
              {onOpenCustomerTracking && (
                <li className="pt-1">
                  <button
                    onClick={onOpenCustomerTracking}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>আপনার অর্ডার ট্র্যাক করুন</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Help */}
          <div className="md:col-span-4 space-y-3 text-left">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              যোগাযোগ ও অর্ডার হেল্পলাইন
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>সরাসরি কল: {BUSINESS_CONFIG.phone}</span>
              </a>

              <a
                href={getWhatsAppInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {BUSINESS_CONFIG.whatsappNumber}</span>
              </a>

              <a
                href={BUSINESS_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>ফেসবুক: {BUSINESS_CONFIG.facebookPageName}</span>
              </a>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block">
                সরাসরি হোম ডেলিভারি: সকাল ৯:০০ টা — রাত ১০:০০ টা
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Policy Placeholders and Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {BUSINESS_CONFIG.brandName}. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-slate-300 transition-colors underline underline-offset-2 cursor-pointer"
            >
              গোপনীয়তা নীতি (Privacy Policy)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-slate-300 transition-colors underline underline-offset-2 cursor-pointer"
            >
              শর্তাবলী (Terms)
            </button>
          </div>
        </div>
      </div>

      {/* Simple Policy Modal Placeholder */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold">
                {activeModal === 'privacy' ? 'গোপনীয়তা নীতি' : 'সেবার শর্তাবলী'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Foody Rahat গ্রাহকদের নাম, ঠিকানা ও ফোন নম্বর কেবল ডেলিভারি ও অর্ডার কনফার্মেশনের কাজেই ব্যবহার করে। কোনো তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
            </p>
            <div className="text-right pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

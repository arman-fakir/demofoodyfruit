import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Phone, Package } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { scrollToSection, toBengaliNumber } from '../lib/utils';

interface HeaderProps {
  totalCartItemsCount: number;
  onOpenCart: () => void;
  onOpenOrderManagement?: () => void;
  onOpenCustomerTracking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCartItemsCount,
  onOpenCart,
  onOpenOrderManagement,
  onOpenCustomerTracking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTrackClick = () => {
    if (onOpenCustomerTracking) {
      onOpenCustomerTracking();
    } else if (onOpenOrderManagement) {
      onOpenOrderManagement();
    }
  };

  const navLinks = [
    { label: 'হোম', id: 'hero-section' },
    { label: 'ফ্লেভার', id: 'products-section' },
    { label: 'কেন আমরা', id: 'why-us-section' },
    { label: 'রিভিউ', id: 'reviews-section' },
    { label: 'যোগাযোগ', id: 'contact-section' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand logo & name */}
        <a
          href="#hero-section"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero-section');
          }}
          className="flex items-center gap-2.5 group text-left shrink-0"
        >
          <img
            src={BUSINESS_CONFIG.logo}
            alt="Foody Rahat Logo"
            className="w-10 h-10 rounded-full object-cover shadow-xs border border-emerald-100 group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-emerald-700 transition-colors">
              {BUSINESS_CONFIG.brandName}
            </span>
            <span className="text-[11px] font-medium text-emerald-700 leading-tight">
              {BUSINESS_CONFIG.categoryBengali}
            </span>
          </div>
        </a>

        {/* Zone 2: Clean desktop nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="hover:text-emerald-700 transition-colors cursor-pointer py-1"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Safe Customer Order Track button */}
          <button
            type="button"
            onClick={handleTrackClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
            title="আপনার ফ্রেশ জুস অর্ডার ট্র্যাক করুন"
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">অর্ডার ট্র্যাক</span>
            <span className="sm:hidden">ট্র্যাক</span>
          </button>

          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="কল করুন"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">{BUSINESS_CONFIG.phone}</span>
            <span className="lg:hidden">কল</span>
          </a>

          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কার্ট</span>
            {totalCartItemsCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 font-bold text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {toBengaliNumber(totalCartItemsCount)}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md focus:outline-none"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drop-down drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleTrackClick();
            }}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>আপনার অর্ডার ট্র্যাক করুন</span>
            </span>
            <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
              ট্র্যাকিং
            </span>
          </button>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left py-2 px-3 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">হেল্পলাইন: {BUSINESS_CONFIG.phone}</span>
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              সরাসরি কল
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

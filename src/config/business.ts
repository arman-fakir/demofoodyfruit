/**
 * CENTRAL BUSINESS CONFIGURATION - FOODY RAHAT
 * 
 * IMPORTANT:
 * All business parameters, contact numbers, delivery charges, and configurable
 * placeholders are centralized here. Modify this file to update the entire storefront.
 */

import logoImage from '../assets/images/foody rahat.jpg';

export interface BusinessConfig {
  brandName: string;
  brandNameEnglish: string;
  categoryBengali: string;
  phone: string;
  whatsappNumber: string;
  whatsappFormatted: string; // for wa.me URL
  logo: string;
  
  // Delivery configurations (BDT)
  deliveryCharges: {
    insideDhaka: number;
    outsideDhaka: number;
  };
  deliveryTimeEstimate: {
    insideDhaka: string;
    outsideDhaka: string;
  };
  
  currencySymbol: string;
  currencyCode: string;

  // Social & External Links (Placeholders clearly marked)
  facebookPageName: string;
  facebookUrl: string; // CONFIGURABLE PLACEHOLDER
  instagramUrl?: string;

  // Physical Location & Legal (Clearly marked placeholders per prompt rules)
  physicalAddressPlaceholder: string;
  tradeLicensePlaceholder?: string;

  // Taglines
  taglines: {
    primary: string;
    sub: string;
    punchline: string;
  };

  // SEO & Social Share defaults
  seo: {
    siteTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    canonicalUrl: string;
  };
}

export const BUSINESS_CONFIG: BusinessConfig = {
  brandName: 'Foody Rahat',
  brandNameEnglish: 'Foody Rahat',
  categoryBengali: 'ফ্রেশ জুস',
  phone: '01571509532',
  whatsappNumber: '01571509532',
  whatsappFormatted: '+8801571509532',
  logo: logoImage,

  // Editable delivery fees
  deliveryCharges: {
    insideDhaka: 60,
    outsideDhaka: 120,
  },

  deliveryTimeEstimate: {
    insideDhaka: '১-২ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি',
    outsideDhaka: '২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি',
  },

  currencySymbol: '৳',
  currencyCode: 'BDT',

  // Social URLs
  facebookPageName: 'Foody Rahat',
  facebookUrl: 'https://facebook.com/foodyrahat', // EDITABLE PLACEHOLDER

  // Business Address Placeholder (To be updated with physical store/hub address)
  physicalAddressPlaceholder: 'ঢাকা, বাংলাদেশ (সরাসরি অনলাইন ডেলিভারি হাব)',
  tradeLicensePlaceholder: 'ট্রেড লাইসেন্স নং: [সংযোজনের অপেক্ষায়]',

  taglines: {
    primary: 'প্রতিদিন তাজা, প্রতিদিন ফ্রেশ',
    sub: '১০০% প্রাকৃতিক | নো প্রিজারভেটিভ | স্বাস্থ্যকর ও পুষ্টিকর',
    punchline: 'এক চুমুকেই ফ্রেশ অনুভূতি!',
  },

  seo: {
    siteTitle: 'ফ্রেশ জুস - ১০০% প্রাকৃতিক ও স্বাস্থ্যকর ফ্রেশ জুস | Foody Rahat',
    metaDescription: 'প্রতিদিন তাজা ও খাঁটি ফল থেকে তৈরি ফ্রেশ জুস। কোনো প্রিজারভেটিভ নেই। আজই অর্ডার করুন Foody Rahat থেকে। কল বা হোয়াটসঅ্যাপ: 01571509532।',
    ogTitle: 'Foody Rahat - ১০০% প্রাকৃতিক ফ্রেশ জুস ও ডিটক্স',
    ogDescription: 'তাজা ফলের নির্ভেজাল সতেজতা সরাসরি আপনার ঘরে। কোনো প্রিজারভেটিভ বা কেমিক্যাল ছাড়া প্রস্তুত।',
    canonicalUrl: 'https://foodyrahat.com',
  },
};

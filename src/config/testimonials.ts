/**
 * TESTIMONIALS CONFIGURATION (PLACEHOLDERS)
 * 
 * In accordance with brand integrity rules, customer reviews below are
 * clearly designated placeholder models for staging & review display.
 * Replace with verified customer feedback once available.
 */

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  rating: number; // 1 to 5
  favoriteFlavor: string;
  comment: string;
  date: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    customerName: 'তানভীর আহমেদ',
    location: 'ধানমন্ডি, ঢাকা',
    rating: 5,
    favoriteFlavor: 'ড্রাগন ফ্রুট জুস',
    comment: 'ড্রাগন ফ্রুট জুসটা অসাধারণ লেগেছে! কোনো বাড়তি চিনি ছিল না, পুরো প্রাকৃতিক মিষ্টি স্বাদ। অফিস শেষে এক বোতল খেলে সত্যিই ফ্রেশ লাগে।',
    date: '৩ দিন আগে',
  },
  {
    id: 'testi-2',
    customerName: 'নুসরাত জাহান',
    location: 'গুলশান ১, ঢাকা',
    rating: 5,
    favoriteFlavor: 'কাঁচা আম ডিটক্স',
    comment: 'কাঁচা আম ও পুদিনার কম্বিনেশনটা দারুণ। গরমে এর চেয়ে ভালো হেলদি ড্রিংক আর হতে পারে না। প্যাকিংও খুব পরিচ্ছন্ন ছিল।',
    date: '১ সপ্তাহ আগে',
  },
  {
    id: 'testi-3',
    customerName: 'ফারহান মাহমুদ',
    location: 'উত্তরা, ঢাকা',
    rating: 5,
    favoriteFlavor: 'অরেঞ্জ / মাল্টা জুস',
    comment: 'আমি নিয়মিত ফ্রেশ জুস খুঁজি। Foody Rahat-এর মাল্টা জুসে কোনো প্রিজারভেটিভ নেই তা খেলেই বোঝা যায়। ডেলিভারিও খুব দ্রুত পেয়েছি।',
    date: '২ সপ্তাহ আগে',
  },
];

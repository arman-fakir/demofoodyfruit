import { Product } from '../types/product';
import heroJuiceImage from '../assets/images/foody_rahat_banner_1790256361295.jpg';
import dragonfruitImage from '../assets/images/product_dragonfruit_juice_1790254566879.jpg';
import orangeMaltaImage from '../assets/images/product_orange_malta_juice_1790254579528.jpg';
import greenMangoImage from '../assets/images/product_green_mango_detox_juice_1790254593250.jpg';
import mixedFruitImage from '../assets/images/product_mixed_fruit_detox_1790254620216.jpg';
import mangoPineappleImage from '../assets/images/product_mango_pineapple_juice_1790254604826.jpg';

export const HERO_IMAGE = heroJuiceImage;

/**
 * PRODUCTS CONFIGURATION
 * 
 * Changing a product price, name, or availability here will automatically update:
 * - Product cards
 * - Checkout product selector
 * - Dynamic price calculation
 * - Order summary
 * - WhatsApp order formatted message
 * - Structured Schema data
 */
export const PRODUCTS: Product[] = [
  {
    id: 'dragon-fruit-juice',
    title: 'ড্রাগন ফ্রুট জুস',
    englishTitle: 'Dragon Fruit Juice',
    description: 'তাজা লাল ড্রাগন ফল থেকে সংগৃহীত অ্যান্টিঅক্সিডেন্ট ও ফাইবার সমৃদ্ধ প্রিমিয়াম স্মুথ জুস।',
    price: 150, // CONFIGURABLE PRICE (BDT)
    unit: '৩৫০ মি.লি.',
    badge: 'সেরা আকর্ষণ',
    colorTheme: 'berry',
    accentHex: '#DB2777',
    bgLightHex: '#FDF2F8',
    image: dragonfruitImage,
    availability: true,
    caloriesEstimate: '১১০ ক্যালরি',
    freshnessNote: 'অর্ডার পাওয়ার পর তাজা ব্লেন্ড করা হয়',
  },
  {
    id: 'orange-malta-juice',
    title: 'অরেঞ্জ / মাল্টা জুস',
    englishTitle: 'Orange / Malta Juice',
    description: 'মিষ্টি ও রসালো সাইট্রাস মাল্টা থেকে নিখুঁতভাবে নিংড়ানো ১০০% খাঁটি ভিটামিন-সি ভরপুর জুস।',
    price: 130, // CONFIGURABLE PRICE (BDT)
    unit: '৩৫০ মি.লি.',
    badge: 'ভিটামিন সি সমৃদ্ধ',
    colorTheme: 'orange',
    accentHex: '#F97316',
    bgLightHex: '#FFF7ED',
    image: orangeMaltaImage,
    availability: true,
    caloriesEstimate: '১২০ ক্যালরি',
    freshnessNote: 'কোনো অতিরিক্ত চিনি বা কৃত্রিম মিষ্টি নেই',
  },
  {
    id: 'green-mango-detox',
    title: 'কাঁচা আম / ডিটক্স জুস',
    englishTitle: 'Green Mango / Detox Juice',
    description: 'তাজা কাঁচা আমের টক-মিষ্টি স্বাদ ও পুদিনার মিশ্রণে তৈরি অত্যন্ত রিফ্রেশিং ও হজমকারক ডিটক্স ড্রিংক।',
    price: 120, // CONFIGURABLE PRICE (BDT)
    unit: '৩৫০ মি.লি.',
    badge: 'ন্যাচারাল কুলার',
    colorTheme: 'green',
    accentHex: '#16A34A',
    bgLightHex: '#F0FDF4',
    image: greenMangoImage,
    availability: true,
    caloriesEstimate: '৯৫ ক্যালরি',
    freshnessNote: 'দেহ ও মনকে মুহূর্তেই চাঙ্গা করে তোলে',
  },
  {
    id: 'mixed-fruit-detox',
    title: 'স্পেশাল মিক্সড ফ্রুট জুস / ডিটক্স ওয়াটার',
    englishTitle: 'Special Mixed Fruit / Detox Water',
    description: 'সিজনাল তাজা ফল ও ভেষজ উপাদানের স্বাস্থ্যকর ব্লেন্ড। পুষ্টি ও সতেজতায় ভরপুর এক স্বর্গীয় স্বাদ।',
    price: 160, // CONFIGURABLE PRICE (BDT)
    unit: '৩৫০ মি.লি.',
    badge: 'প্রিমিয়াম ডিটক্স',
    colorTheme: 'mixed',
    accentHex: '#9333EA',
    bgLightHex: '#FAF5FF',
    image: mixedFruitImage,
    availability: true,
    caloriesEstimate: '১০৫ ক্যালরি',
    freshnessNote: 'শরীর থেকে টক্সিন দূর করতে সহায়ক',
  },
  {
    id: 'mango-pineapple-juice',
    title: 'ম্যাঙ্গো / পাইনঅ্যাপেল জুস',
    englishTitle: 'Mango / Pineapple Juice',
    description: 'মিষ্টি পাকা আম ও আনারসের মিষ্টি সুবাসে তৈরি গ্রীষ্মকালীন ট্রপিক্যাল এনার্জি ড্রিংক।',
    price: 140, // CONFIGURABLE PRICE (BDT)
    unit: '৩৫০ মি.লি.',
    badge: 'ট্রপিক্যাল ব্লেন্ড',
    colorTheme: 'yellow',
    accentHex: '#CA8A04',
    bgLightHex: '#FEFCE8',
    image: mangoPineappleImage,
    availability: true,
    caloriesEstimate: '১৩০ ক্যালরি',
    freshnessNote: '১০০% প্রাকৃতিক পাল্পের পূর্ণ অনুভূতি',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

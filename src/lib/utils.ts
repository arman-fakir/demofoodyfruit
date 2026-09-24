import { BUSINESS_CONFIG } from '../config/business';

// Bengali digit map
const BENGALI_DIGITS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

/**
 * Formats a number to Bengali numerals with Bangladeshi Taka currency symbol
 * e.g., 450 -> ৳৪৫০
 */
export function formatCurrencyBn(amount: number, showSymbol = true): string {
  const str = Math.round(amount).toString();
  const bnNumber = str.replace(/[0-9]/g, (w) => BENGALI_DIGITS[w] || w);
  return showSymbol ? `${BUSINESS_CONFIG.currencySymbol}${bnNumber}` : bnNumber;
}

/**
 * Converts English number to Bengali digits string
 */
export function toBengaliNumber(num: number | string): string {
  return num.toString().replace(/[0-9]/g, (w) => BENGALI_DIGITS[w] || w);
}

/**
 * Smooth scroll helper targeting an element ID with header offset
 */
export function scrollToSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (el) {
    const yOffset = -80;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

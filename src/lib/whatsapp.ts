import { BUSINESS_CONFIG } from '../config/business';
import { CartItem } from '../types/product';
import { OrderFormData, DeliveryArea } from '../types/order';
import { formatCurrencyBn, toBengaliNumber } from './utils';

export interface WhatsAppOrderItem {
  productTitle: string;
  quantity: number;
  subtotal: number;
  unit?: string;
}

export interface WhatsAppMessageParams {
  items?: CartItem[];
  orderItems?: WhatsAppOrderItem[];
  orderId?: string;
  formData?: Partial<OrderFormData>;
  deliveryArea: DeliveryArea;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
}

/**
 * Builds a structured, beautifully formatted Bengali WhatsApp order message
 */
export function generateWhatsAppOrderMessage(params: WhatsAppMessageParams): string {
  const { items, orderItems, orderId, formData, deliveryArea, subtotal, deliveryCharge, grandTotal } = params;

  const areaLabel = deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে';

  // Build items list from orderItems or items
  let itemsText = '';
  if (orderItems && orderItems.length > 0) {
    itemsText = orderItems
      .filter((item) => item.quantity > 0)
      .map(
        (item) =>
          `• ${item.productTitle}${item.unit ? ` (${item.unit})` : ''} × ${toBengaliNumber(item.quantity)} = ${formatCurrencyBn(item.subtotal)}`
      )
      .join('\n');
  } else {
    itemsText = (items || [])
      .filter((item) => item && item.product && item.quantity > 0)
      .map(
        (item) =>
          `• ${item.product.title} (${item.product.unit}) × ${toBengaliNumber(item.quantity)} = ${formatCurrencyBn(
            (item.product.price || 0) * item.quantity
          )}`
      )
      .join('\n');
  }

  const customerName = formData?.customerName?.trim() || '[নাম প্রদান করা হয়নি]';
  const phone = formData?.phone?.trim() || '[মোবাইল নম্বর দেওয়া হয়নি]';
  const address = formData?.address?.trim() || '[ঠিকানা প্রদান করা হয়নি]';
  const notes = formData?.specialNotes?.trim() ? `\nবিশেষ নোট: ${formData.specialNotes.trim()}` : '';
  const orderIdLine = orderId ? `\n📌 *অর্ডার ট্র্যাকিং আইডি:* ${orderId}` : '';

  const message = `আসসালামু আলাইকুম,
আমি Foody Rahat থেকে ফ্রেশ জুস অর্ডার করতে চাই।${orderIdLine}

🛒 *অর্ডারের বিবরণ:*
${itemsText}

━━━━━━━━━━━━━━━
💵 *হিসাব:*
সাবটোটাল: ${formatCurrencyBn(subtotal)}
ডেলিভারি চার্জ: ${formatCurrencyBn(deliveryCharge)} (${areaLabel})
*সর্বমোট প্রদেয়: ${formatCurrencyBn(grandTotal)}*
পেমেন্ট মাধ্যম: ক্যাশ অন ডেলিভারি (COD)

👤 *কাস্টমার তথ্য:*
নাম: ${customerName}
মোবাইল: ${phone}
ঠিকানা: ${address}
এলাকা: ${areaLabel}${notes}

দয়া করে আমার অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;

  return message;
}

/**
 * Generates direct WhatsApp URL with safe URL encoding
 */
export function getWhatsAppOrderUrl(params: WhatsAppMessageParams): string {
  const message = generateWhatsAppOrderMessage(params);
  const cleanPhone = BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  // Bangladesh country code 88 if not already present
  const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a general WhatsApp inquiry link
 */
export function getWhatsAppInquiryUrl(customNote?: string): string {
  const defaultText = `আসসালামু আলাইকুম, Foody Rahat থেকে ফ্রেশ জুস সম্পর্কিত তথ্য ও অর্ডার জানতে চাই।`;
  const text = customNote || defaultText;
  const cleanPhone = BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

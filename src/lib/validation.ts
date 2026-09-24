import { z, ZodIssue } from 'zod';
import { CartItem } from '../types/product';

// Bangladeshi phone regex: matches 013-019 followed by 8 digits, with optional +88 or 88 prefix
const BD_PHONE_REGEX = /^(?:\+88|88)?(01[3-9]\d{8})$/;

export const orderFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'আপনার সম্পূর্ণ নাম লিখুন (কমপক্ষে ২টি অক্ষর)'),
  phone: z
    .string()
    .trim()
    .min(11, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন')
    .refine((val) => {
      const cleaned = val.replace(/[\s-]/g, '');
      return BD_PHONE_REGEX.test(cleaned);
    }, 'অনুগ্রহ করে সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 015XXXXXXXX বা 017XXXXXXXX)'),
  address: z
    .string()
    .trim()
    .min(8, 'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা নং, রোড, এলাকা)'),
  deliveryArea: z.enum(['inside_dhaka', 'outside_dhaka'] as const),
  specialNotes: z.string().trim().max(300, 'বিশেষ নোট ৩০০ অক্ষরের মধ্যে রাখুন').optional(),
});

export type OrderFormSchemaType = z.infer<typeof orderFormSchema>;

type ItemWithQuantity = CartItem | { productId: string; quantity: number };

/**
 * Validates full order payload including cart items
 */
export function validateOrder(
  formData: OrderFormSchemaType,
  cartItems: ItemWithQuantity[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const formResult = orderFormSchema.safeParse(formData);
  if (!formResult.success) {
    formResult.error.issues.forEach((err: ZodIssue) => {
      const field = String(err.path[0] || 'general');
      if (!errors[field]) {
        errors[field] = err.message;
      }
    });
  }

  const validItems = cartItems.filter((item) => item.quantity > 0);
  if (validItems.length === 0) {
    errors['items'] = 'কমপক্ষে একটি ফ্রেশ জুস সিলেক্ট করুন';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

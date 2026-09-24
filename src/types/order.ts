import { CartItem } from './product';

export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export interface OrderFormData {
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  specialNotes?: string;
}

export interface OrderCalculation {
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  totalQuantity: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryArea: DeliveryArea;
  deliveryAreaLabel: string;
  items: Array<{
    productId: string;
    productTitle: string;
    englishTitle: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  specialNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface OrderSubmitResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  order?: OrderRecord;
}

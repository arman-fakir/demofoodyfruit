import { OrderRecord } from '../types/order';

export function getStatusLabelBengali(status: OrderRecord['status']): string {
  switch (status) {
    case 'CONFIRMED':
      return 'কনফার্মড (Confirmed)';
    case 'PROCESSING':
      return 'প্রসেসিং (Processing)';
    case 'DELIVERED':
      return 'ডেলিভারড (Delivered)';
    case 'CANCELLED':
      return 'বাতিল (Cancelled)';
    case 'PENDING':
    default:
      return 'অপেক্ষমান (Pending)';
  }
}

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  // If string contains comma, quote, or newline, escape quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function formatOrdersForCsv(orders: OrderRecord[]): string {
  const headers = [
    'অর্ডার আইডি',
    'তারিখ ও সময়',
    'গ্রাহকের নাম',
    'মোবাইল নম্বর',
    'ডেলিভারি ঠিকানা',
    'ডেলিভারি এলাকা',
    'অর্ডারকৃত পণ্যসমূহ',
    'মোট বোতল',
    'পণ্য বিল (৳)',
    'ডেলিভারি চার্জ (৳)',
    'সর্বমোট বিল (৳)',
    'অর্ডার স্ট্যাটাস',
    'গ্রাহকের বিশেষ নোট',
    'কুরিয়ার নোট',
  ];

  const rows = (orders || []).map((order) => {
    const dateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleString('bn-BD', {
          timeZone: 'Asia/Dhaka',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';

    const itemsSummary = (order.items || [])
      .map((i) => `${i.productTitle} x ${i.quantity} (৳${i.subtotal})`)
      .join(' | ');

    const totalBottles = (order.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

    const courierNote = `Foody Rahat - ID: #${order.id}, নাম: ${order.customerName}, ফোন: ${order.phone}, ঠিকানা: ${order.address}, বিল: ৳${order.grandTotal} (ক্যাশ অন ডেলিভারি)`;

    return [
      escapeCsvCell(order.id),
      escapeCsvCell(dateFormatted || order.createdAt),
      escapeCsvCell(order.customerName),
      escapeCsvCell(order.phone),
      escapeCsvCell(order.address),
      escapeCsvCell(order.deliveryAreaLabel || (order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে')),
      escapeCsvCell(itemsSummary),
      escapeCsvCell(totalBottles),
      escapeCsvCell(order.subtotal || 0),
      escapeCsvCell(order.deliveryCharge || 0),
      escapeCsvCell(order.grandTotal || 0),
      escapeCsvCell(getStatusLabelBengali(order.status)),
      escapeCsvCell(order.specialNotes || 'নেই'),
      escapeCsvCell(courierNote),
    ].join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) so Google Sheets & Excel render Bengali font properly
  return '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
}

export function formatOrdersForTsv(orders: OrderRecord[]): string {
  const headers = [
    'অর্ডার আইডি',
    'তারিখ ও সময়',
    'গ্রাহকের নাম',
    'মোবাইল নম্বর',
    'ডেলিভারি ঠিকানা',
    'ডেলিভারি এলাকা',
    'অর্ডারকৃত পণ্যসমূহ',
    'মোট বোতল',
    'পণ্য বিল (৳)',
    'ডেলিভারি চার্জ (৳)',
    'সর্বমোট বিল (৳)',
    'অর্ডার স্ট্যাটাস',
    'গ্রাহকের বিশেষ নোট',
  ];

  const rows = (orders || []).map((order) => {
    const dateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleString('bn-BD', {
          timeZone: 'Asia/Dhaka',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';

    const itemsSummary = (order.items || [])
      .map((i) => `${i.productTitle} x ${i.quantity} (৳${i.subtotal})`)
      .join(', ');

    const totalBottles = (order.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

    const clean = (val: any) =>
      String(val ?? '')
        .replace(/\t/g, ' ')
        .replace(/\r?\n/g, ' ');

    return [
      clean(order.id),
      clean(dateFormatted || order.createdAt),
      clean(order.customerName),
      clean(order.phone),
      clean(order.address),
      clean(order.deliveryAreaLabel || (order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে')),
      clean(itemsSummary),
      clean(totalBottles),
      clean(order.subtotal || 0),
      clean(order.deliveryCharge || 0),
      clean(order.grandTotal || 0),
      clean(getStatusLabelBengali(order.status)),
      clean(order.specialNotes || 'নেই'),
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}

/**
 * Downloads orders as a Google Sheets-compatible CSV file.
 */
export function downloadOrdersAsGoogleSheetsCSV(
  orders: OrderRecord[],
  filenamePrefix = 'foody-rahat-orders'
): void {
  if (!orders || orders.length === 0) {
    alert('ডাউনলোড করার জন্য কোনো অর্ডার ডেটা নেই!');
    return;
  }

  const csvContent = formatOrdersForCsv(orders);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies table data formatted for Google Sheets directly to clipboard
 * and optionally opens Google Sheets in a new tab.
 */
export async function copyAndOpenGoogleSheets(
  orders: OrderRecord[],
  openNewTab = true
): Promise<boolean> {
  if (!orders || orders.length === 0) {
    alert('গুগল শীটে নেয়ার মতো কোনো ডেটা নেই!');
    return false;
  }

  try {
    const tsv = formatOrdersForTsv(orders);
    await navigator.clipboard.writeText(tsv);

    if (openNewTab) {
      window.open('https://sheets.new', '_blank');
    }
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    // Fallback to CSV download
    downloadOrdersAsGoogleSheetsCSV(orders);
    return false;
  }
}

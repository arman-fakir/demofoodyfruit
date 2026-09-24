import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  MessageCircle,
  Copy,
  Check,
  X,
  Printer,
  ShoppingBag,
  TrendingUp,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { formatCurrencyBn, toBengaliNumber } from '../lib/utils';
import { OrderRecord } from '../types/order';
import {
  getLocalOrders,
  findOrderByIdOrPhone,
  updateOrderStatus,
  deleteOrder,
  SAMPLE_ORDERS,
} from '../lib/orderService';
import {
  downloadOrdersAsGoogleSheetsCSV,
  copyAndOpenGoogleSheets,
} from '../lib/exportToGoogleSheet';

interface OrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderManagementModal: React.FC<OrderManagementModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [activeTab, setActiveTab] = useState<'track' | 'dashboard'>('track');
  const [searchQuery, setSearchQuery] = useState(initialOrderId || 'FR-73004143');
  const [currentOrder, setCurrentOrder] = useState<OrderRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Load orders when modal opens
  useEffect(() => {
    if (isOpen) {
      const orders = getLocalOrders();
      setAllOrders(orders);

      const targetId = initialOrderId || searchQuery || 'FR-73004143';
      if (targetId) {
        setSearchQuery(targetId);
        const found = findOrderByIdOrPhone(targetId);
        if (found) {
          setCurrentOrder(found);
          setHasSearched(true);
        }
      }
    }
  }, [isOpen, initialOrderId]);

  // Search handler
  const handleSearch = (queryToSearch?: string) => {
    const q = queryToSearch !== undefined ? queryToSearch : searchQuery;
    setHasSearched(true);
    if (!q.trim()) {
      setCurrentOrder(null);
      return;
    }
    const found = findOrderByIdOrPhone(q.trim());
    setCurrentOrder(found);
  };

  // Status update handler
  const handleStatusChange = (orderId: string, newStatus: OrderRecord['status']) => {
    const success = updateOrderStatus(orderId, newStatus);
    if (success) {
      const updatedList = getLocalOrders();
      setAllOrders(updatedList);
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status: newStatus });
      }
    }
  };

  // Delete order handler
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে অর্ডার #${orderId} মুছে ফেলতে চান?`)) {
      deleteOrder(orderId);
      const updatedList = getLocalOrders();
      setAllOrders(updatedList);
      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
      }
    }
  };

  // Copy courier delivery note (Steadfast / Pathao / RedX format)
  const handleCopyCourierNote = (order: OrderRecord) => {
    const itemsList = (order.items || [])
      .map((i) => `${i?.productTitle || 'জুস'} x ${i?.quantity || 1}`)
      .join(', ');
    const noteText = `[Foody Rahat - কুরিয়ার পার্সেল নোট]
অর্ডার আইডি: ${order.id}
গ্রাহকের নাম: ${order.customerName}
মোবাইল নম্বর: ${order.phone}
ঠিকানা: ${order.address} (${order.deliveryAreaLabel || 'ঢাকার ভেতরে'})
পণ্য: ${itemsList || 'ফ্রেশ জুস'}
কালেকশন অ্যামাউন্ট (COD): ৳${order.grandTotal || 0} টাকা
বিশেষ নির্দেশনা: ${order.specialNotes || 'দ্রুত ফ্রেশ সরবরাহ করুন'}`;

    navigator.clipboard.writeText(noteText).then(() => {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2500);
    });
  };

  // Copy Order ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  // Direct WhatsApp update to customer
  const getCustomerWhatsAppUrl = (order: OrderRecord) => {
    const cleanCustomerPhone = (order.phone || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanCustomerPhone.startsWith('88')
      ? cleanCustomerPhone
      : `88${cleanCustomerPhone}`;

    const itemsSummary = (order.items || [])
      .map((i) => `${i?.productTitle || 'জুস'} (${toBengaliNumber(i?.quantity || 1)}টি)`)
      .join(', ');

    const text = `আসসালামু আলাইকুম ${order.customerName || 'সম্মানিত গ্রাহক'},
Foody Rahat থেকে আপনার ফ্রেশ জুস অর্ডার (${order.id}) সম্পর্কিত আপডেট:

📦 অর্ডারের বর্তমান অবস্থা: ${getStatusLabel(order.status)}
🛒 আইটেম: ${itemsSummary || 'ফ্রেশ জুস'}
💵 প্রদেয় বিল: ৳${order.grandTotal || 0} (ক্যাশ অন ডেলিভারি)
📍 ডেলিভারি ঠিকানা: ${order.address || ''}

যেকোনো প্রয়োজনে আমাদের হটলাইন ${BUSINESS_CONFIG.phone}-এ যোগাযোগ করুন। ধন্যবাদ!`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  // Status details
  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            অর্ডার নিশ্চিত (Confirmed)
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            জুস তৈরি হচ্ছে (Processing)
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <Truck className="w-3.5 h-3.5 text-teal-600" />
            ডেলিভারি সম্পন্ন (Delivered)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <X className="w-3.5 h-3.5 text-rose-600" />
            বাতিল (Cancelled)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            অপেক্ষমান (Pending)
          </span>
        );
    }
  };

  const getStatusLabel = (status: OrderRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'অর্ডার নিশ্চিত (Confirmed)';
      case 'PROCESSING':
        return 'জুস তৈরি ও প্যাকিং হচ্ছে (Processing)';
      case 'DELIVERED':
        return 'ডেলিভারি সম্পন্ন (Delivered)';
      case 'CANCELLED':
        return 'বাতিল (Cancelled)';
      default:
        return 'অপেক্ষমান (Pending)';
    }
  };

  // Statistics calculation for business owner
  const stats = useMemo(() => {
    const validOrders = (allOrders || []).filter((o) => o && typeof o === 'object');
    const totalCount = validOrders.length;
    const totalRevenue = validOrders
      .filter((o) => o?.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o?.grandTotal || 0), 0);
    const activeCount = validOrders.filter(
      (o) => o?.status === 'CONFIRMED' || o?.status === 'PROCESSING' || o?.status === 'PENDING'
    ).length;
    const deliveredCount = validOrders.filter((o) => o?.status === 'DELIVERED').length;

    return { totalCount, totalRevenue, activeCount, deliveredCount };
  }, [allOrders]);

  // Exact counts for each status filter tab
  const statusCounts = useMemo(() => {
    const validOrders = (allOrders || []).filter((o) => o && typeof o === 'object');
    return {
      ALL: validOrders.length,
      CONFIRMED: validOrders.filter((o) => o?.status === 'CONFIRMED').length,
      PROCESSING: validOrders.filter((o) => o?.status === 'PROCESSING').length,
      DELIVERED: validOrders.filter((o) => o?.status === 'DELIVERED').length,
      CANCELLED: validOrders.filter((o) => o?.status === 'CANCELLED').length,
    };
  }, [allOrders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const validOrders = (allOrders || []).filter((o) => o && typeof o === 'object');
    if (statusFilter === 'ALL') return validOrders;
    return validOrders.filter((o) => o?.status === statusFilter);
  }, [allOrders, statusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={BUSINESS_CONFIG.logo}
              alt="Foody Rahat"
              className="w-10 h-10 rounded-full border-2 border-white/40 shadow-sm bg-white object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  অর্ডার ট্র্যাকিং ও ব্যবসায়িক কন্ট্রোল সেন্টার
                </h2>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Foody Rahat Official
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                ব্যবসায়ী ও গ্রাহক উভয়ের জন্য অর্ডার অনুসন্ধান ও ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-8 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'track'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>অর্ডার চেক করুন (Order Lookup)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>সকল অর্ডার ড্যাশবোর্ড ({toBengaliNumber(allOrders.length)})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= TAB 1: ORDER TRACK & LOOKUP ================= */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              {/* Search Bar Box */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-100">
                <label
                  htmlFor="order-search-input"
                  className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2"
                >
                  অর্ডার আইডি বা মোবাইল নম্বর লিখুন
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="flex flex-col sm:flex-row items-stretch gap-2.5"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                    <input
                      id="order-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="যেমন: FR-73004143 অথবা 01571509532"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-emerald-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>চেক করুন</span>
                  </button>
                </form>

                {/* Quick suggestions pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">দ্রুত পরীক্ষা করুন:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('FR-73004143');
                      handleSearch('FR-73004143');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>FR-73004143</span>
                    <span className="text-[10px] text-emerald-600">(ক্লিক করুন)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('01571509532');
                      handleSearch('01571509532');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>01571509532</span>
                  </button>
                </div>
              </div>

              {/* Found Order Card */}
              {currentOrder ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in-50 duration-200">
                  {/* Order Top Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                          অর্ডার ট্র্যাকিং আইডি
                        </span>
                        <button
                          onClick={() => handleCopyId(currentOrder.id)}
                          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                          title="অর্ডার আইডি কপি করুন"
                        >
                          {copiedId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide">
                        #{currentOrder.id}
                      </h3>
                      <p className="text-xs text-slate-300">
                        তারিখ:{' '}
                        {new Date(currentOrder.createdAt).toLocaleString('bn-BD', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    <div className="text-right space-y-2">
                      <div>{getStatusBadge(currentOrder.status)}</div>
                      <p className="text-xs text-slate-300">
                        মোট প্রদেয় বিল:{' '}
                        <span className="text-base font-bold text-white">
                          ৳{toBengaliNumber(currentOrder.grandTotal)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Business Owner Quick Action Toolbelt */}
                  <div className="bg-amber-50/80 border-b border-amber-200 px-4 sm:px-6 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-900 uppercase">
                          অর্ডার স্ট্যাটাস পরিবর্তন:
                        </span>
                        <select
                          value={currentOrder.status}
                          onChange={(e) =>
                            handleStatusChange(
                              currentOrder.id,
                              e.target.value as OrderRecord['status']
                            )
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        >
                          <option value="CONFIRMED">অর্ডার নিশ্চিত (CONFIRMED)</option>
                          <option value="PROCESSING">জুস তৈরি হচ্ছে (PROCESSING)</option>
                          <option value="DELIVERED">ডেলিভারি সম্পন্ন (DELIVERED)</option>
                          <option value="CANCELLED">বাতিল (CANCELLED)</option>
                        </select>
                      </div>

                      {/* Quick Communication Buttons */}
                      <div className="flex items-center flex-wrap gap-2">
                        <a
                          href={`tel:${currentOrder.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>কল করুন</span>
                        </a>

                        <a
                          href={getCustomerWhatsAppUrl(currentOrder)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp আপডেট</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyCourierNote(currentOrder)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                        >
                          {copiedNote ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          <span>
                            {copiedNote ? 'কুরিয়ার তথ্য কপি হয়েছে!' : 'কুরিয়ার স্লিপ কপি'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer and Order Details Grid */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Customer Profile */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
                        গ্রাহকের তথ্য
                      </h4>

                      <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm border border-slate-100">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 w-24 shrink-0 font-medium">নাম:</span>
                          <span className="font-bold text-slate-900">
                            {currentOrder.customerName}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 w-24 shrink-0 font-medium">মোবাইল:</span>
                          <a
                            href={`tel:${currentOrder.phone}`}
                            className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{currentOrder.phone}</span>
                          </a>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 w-24 shrink-0 font-medium">ঠিকানা:</span>
                          <span className="text-slate-800 font-medium">
                            {currentOrder.address}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 w-24 shrink-0 font-medium">এলাকা:</span>
                          <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                            {currentOrder.deliveryAreaLabel} (চার্জ: ৳
                            {toBengaliNumber(currentOrder.deliveryCharge)})
                          </span>
                        </div>
                        {currentOrder.specialNotes && (
                          <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                            <span className="text-amber-700 w-24 shrink-0 font-medium">নোট:</span>
                            <span className="text-slate-700 italic">
                              "{currentOrder.specialNotes}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Order Items & Pricing Breakdown */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
                        অর্ডারকৃত জুসের তালিকা
                      </h4>

                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                        {(currentOrder?.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white flex items-center justify-between text-sm hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                                {toBengaliNumber(idx + 1)}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {item?.productTitle || 'ফ্রেশ জুস'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ৳{toBengaliNumber(item?.unitPrice || 0)} ×{' '}
                                  {toBengaliNumber(item?.quantity || 1)} বোতল
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">
                              ৳{toBengaliNumber(
                                item?.subtotal || (item?.unitPrice || 0) * (item?.quantity || 1)
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Cost Summary Box */}
                      <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 text-xs sm:text-sm border border-slate-100">
                        <div className="flex justify-between text-slate-600">
                          <span>জুসের মোট মূল্য (Subtotal):</span>
                          <span className="font-semibold text-slate-900">
                            ৳{toBengaliNumber(currentOrder.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>ডেলিভারি চার্জ ({currentOrder.deliveryAreaLabel}):</span>
                          <span className="font-semibold text-slate-900">
                            ৳{toBengaliNumber(currentOrder.deliveryCharge)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-bold text-emerald-900">
                          <span>সর্বমোট প্রদেয় বিল (COD):</span>
                          <span className="text-lg font-black text-emerald-700">
                            ৳{toBengaliNumber(currentOrder.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : hasSearched ? (
                /* Not Found State */
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800 mb-1">
                    অর্ডার খুঁজে পাওয়া যায়নি
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
                    "{searchQuery}" এর সাথে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার
                    আইডি (যেমন: FR-73004143) বা মোবাইল নম্বর দিন।
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('FR-73004143');
                      handleSearch('FR-73004143');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    ডেমো অর্ডার FR-73004143 লোড করুন
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* ================= TAB 2: BUSINESS DASHBOARD (ALL ORDERS) ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Business Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 block mb-1">
                    মোট অর্ডার
                  </span>
                  <div className="text-2xl font-black text-emerald-900">
                    {toBengaliNumber(stats.totalCount)} টি
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <span className="text-xs font-semibold text-blue-700 block mb-1">
                    চলমান অর্ডার
                  </span>
                  <div className="text-2xl font-black text-blue-900">
                    {toBengaliNumber(stats.activeCount)} টি
                  </div>
                </div>

                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                  <span className="text-xs font-semibold text-teal-700 block mb-1">
                    ডেলিভারি সম্পন্ন
                  </span>
                  <div className="text-2xl font-black text-teal-900">
                    {toBengaliNumber(stats.deliveredCount)} টি
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <span className="text-xs font-semibold text-amber-700 block mb-1">
                    মোট বিক্রি (৳)
                  </span>
                  <div className="text-2xl font-black text-amber-900">
                    ৳{toBengaliNumber(stats.totalRevenue)}
                  </div>
                </div>
              </div>

              {/* Filter controls & Google Sheets Export */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL'
                        ? `সকল (${statusCounts.ALL})`
                        : st === 'CONFIRMED'
                        ? `কনফার্মড(${statusCounts.CONFIRMED})`
                        : st === 'PROCESSING'
                        ? `প্রসেসিং(${statusCounts.PROCESSING})`
                        : st === 'DELIVERED'
                        ? `ডেলিভারড(${statusCounts.DELIVERED})`
                        : `বাতিল(${statusCounts.CANCELLED})`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-500 font-medium">
                    দেখাচ্ছে: {toBengaliNumber(filteredOrders.length)} টি অর্ডার
                  </span>

                  {/* Google Sheets Download Button */}
                  <button
                    onClick={() =>
                      downloadOrdersAsGoogleSheetsCSV(
                        filteredOrders,
                        `foody-rahat-orders-${statusFilter.toLowerCase()}`
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
                    title="এই টেবিল ডেটা গুগল শীটে (.csv) ডাউনলোড করুন"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                    <span>গুগল শীটে ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* All Orders Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">অর্ডার আইডি</th>
                        <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                        <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                        <th className="py-3 px-4">মোট বিল</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                              #{order.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{order.customerName}</div>
                              <div className="text-xs text-slate-500">{order.phone}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              <span className="font-semibold text-slate-900">
                                {toBengaliNumber(
                                  (order?.items || []).reduce(
                                    (sum, i) => sum + (i?.quantity || 0),
                                    0
                                  )
                                )}{' '}
                                বোতল
                              </span>
                              <span className="text-xs text-slate-500 block truncate max-w-[160px]">
                                {(order?.items || [])
                                  .map((i) => i?.productTitle || '')
                                  .filter(Boolean)
                                  .join(', ') || 'ফ্রেশ জুস'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              ৳{toBengaliNumber(order?.grandTotal || 0)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.id,
                                    e.target.value as OrderRecord['status']
                                  )
                                }
                                className="text-xs font-bold px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="CONFIRMED">কনফার্মড</option>
                                <option value="PROCESSING">প্রসেসিং</option>
                                <option value="DELIVERED">ডেলিভারড</option>
                                <option value="CANCELLED">বাতিল</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setCurrentOrder(order);
                                    setActiveTab('track');
                                    setSearchQuery(order.id);
                                    setHasSearched(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded text-xs transition-colors cursor-pointer"
                                  title="বিস্তারিত দেখুন"
                                >
                                  বিস্তারিত
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                            কোনো অর্ডার পাওয়া যায়নি।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              ব্যবসায়িক হটলাইন: <strong>{BUSINESS_CONFIG.phone}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

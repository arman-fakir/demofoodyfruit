import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  Unlock,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
  ChevronDown,
  Filter,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  fetchAdminOrders,
  adminLogin,
  hasAdminSession,
  adminLogout,
  updateAdminOrderStatus,
  deleteAdminOrder,
} from '../lib/orderService';
import { OrderRecord } from '../types/order';
import { BUSINESS_CONFIG } from '../config/business';
import { toBengaliNumber } from '../lib/utils';
import {
  downloadOrdersAsGoogleSheetsCSV,
  copyAndOpenGoogleSheets,
} from '../lib/exportToGoogleSheet';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ isOpen, onClose, fullScreen = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderRecord['status']>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 3500);
  };

  // Verify the server-managed httpOnly session on open.
  useEffect(() => {
    if (isOpen) {
      void hasAdminSession().then((isValid) => {
        setIsAuthenticated(isValid);
        if (isValid) loadOrders();
        else {
          setPinInput('');
          setPinError(null);
        }
      });
    }
  }, [isOpen]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('অনুগ্রহ করে অ্যাডমিন পিন (PIN) দিন');
      return;
    }

    setLoginLoading(true);
    setPinError(null);

    const res = await adminLogin(pinInput);
    setLoginLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      await loadOrders();
    } else {
      setPinError(res.message || 'ভুল পিন কোড! পুনরায় চেষ্টা করুন।');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
    setOrders([]);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderRecord['status']) => {
    const success = await updateAdminOrderStatus(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast('অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে।');
    } else {
      showToast('স্ট্যাটাস আপডেট করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`আপনি কি সত্যিই অর্ডার #${orderId} মুছে ফেলতে চান?`)) {
      const success = await deleteAdminOrder(orderId);
      if (success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      }
    }
  };

  const handleCopyCourierNote = (order: OrderRecord) => {
    const itemsList = (order.items || [])
      .map((i) => `${i?.productTitle || 'জুস'} x ${i?.quantity || 1}`)
      .join(', ');
    const noteText = `[Foody Rahat - কুরিয়ার পার্সেল ইনভয়েস]
অর্ডার আইডি: ${order.id}
গ্রাহকের নাম: ${order.customerName}
মোবাইল: ${order.phone}
ঠিকানা: ${order.address} (${order.deliveryAreaLabel || 'ঢাকার ভেতরে'})
পণ্য: ${itemsList || 'ফ্রেশ জুস'}
কালেকশন অ্যামাউন্ট (COD): ৳${order.grandTotal || 0} টাকা
বিশেষ নির্দেশনা: ${order.specialNotes || 'ফ্রেশ জুস - সাবধানে হ্যান্ডেল করুন'}`;

    navigator.clipboard.writeText(noteText).then(() => {
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Stats
  const stats = useMemo(() => {
    const validOrders = (orders || []).filter((o) => o && typeof o === 'object');
    const totalCount = validOrders.length;
    const totalRevenue = validOrders
      .filter((o) => o?.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o?.grandTotal || 0), 0);
    const activeCount = validOrders.filter(
      (o) => o?.status === 'CONFIRMED' || o?.status === 'PROCESSING' || o?.status === 'PENDING'
    ).length;
    const deliveredCount = validOrders.filter((o) => o?.status === 'DELIVERED').length;

    return { totalCount, totalRevenue, activeCount, deliveredCount };
  }, [orders]);

  // Exact status counts for filter tabs
  const statusCounts = useMemo(() => {
    const validOrders = (orders || []).filter((o) => o && typeof o === 'object');
    return {
      ALL: validOrders.length,
      CONFIRMED: validOrders.filter((o) => o?.status === 'CONFIRMED').length,
      PROCESSING: validOrders.filter((o) => o?.status === 'PROCESSING').length,
      DELIVERED: validOrders.filter((o) => o?.status === 'DELIVERED').length,
      CANCELLED: validOrders.filter((o) => o?.status === 'CANCELLED').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const validOrders = (orders || []).filter((o) => o && typeof o === 'object');
    const query = searchQuery.trim().toLowerCase();
    return validOrders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesSearch = !query || [order.id, order.customerName, order.phone, order.address]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchQuery, statusFilter]);

  if (!isOpen) return null;

  return (
    <div className={fullScreen
      ? 'min-h-screen w-full bg-slate-100 animate-fade-in'
      : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto'}>
      <div className={fullScreen
        ? 'bg-white min-h-screen w-full overflow-hidden'
        : 'bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-auto'}>
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="relative min-w-[220px] flex-1 max-w-sm order-3 lg:order-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="অর্ডার আইডি, নাম বা মোবাইল খুঁজুন"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Foody Rahat মার্চেন্ট ও অ্যাডমিন ব্যাকএন্ড
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                  সুরক্ষিত কন্ট্রোল প্যানেল
                </span>
              </div>
              <p className="text-xs text-slate-400">
                শুধুমাত্র শপ ম্যানেজমেন্ট এবং ব্যবসা পরিচালনার জন্য
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Security PIN Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">সিকিউরিটি পিন (PIN) যাচাই</h4>
              <p className="text-sm text-slate-500 mt-1">
                গ্রাহকদের তথ্য সুরক্ষার জন্য অ্যাডমিন প্যানেল পাসওয়ার্ড বা পিন দিয়ে সুরক্ষিত।
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  অ্যাডমিন পিন কোড
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="সিকিউরিটি পিন দিন"
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-center tracking-widest text-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-center">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-400">
                নিরাপত্তার জন্য শুধুমাত্র সেট করা অ্যাডমিন পাসওয়ার্ড ব্যবহার করুন।
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Control Room */
          <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-semibold text-emerald-800">মোট বিক্রয় / রেভিনিউ</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
                  ৳{toBengaliNumber(stats.totalRevenue)}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">সম্পূর্ণ সফল ও প্রসেসিং</span>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl">
                <span className="text-xs font-semibold text-blue-800">মোট অর্ডার</span>
                <p className="text-xl sm:text-2xl font-bold text-blue-950 mt-1">
                  {toBengaliNumber(stats.totalCount)} টি
                </p>
                <span className="text-[11px] text-blue-600 font-medium">সার্ভার ডাটাবেজ</span>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl">
                <span className="text-xs font-semibold text-amber-800">চলমান / প্রসেসিং</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-950 mt-1">
                  {toBengaliNumber(stats.activeCount)} টি
                </p>
                <span className="text-[11px] text-amber-600 font-medium">কুরিয়ার ও তৈরি হচ্ছে</span>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl">
                <span className="text-xs font-semibold text-purple-800">ডেলিভারড</span>
                <p className="text-xl sm:text-2xl font-bold text-purple-950 mt-1">
                  {toBengaliNumber(stats.deliveredCount)} টি
                </p>
                <span className="text-[11px] text-purple-600 font-medium">সফল ডেলিভারি সম্পন্ন</span>
              </div>
            </div>

            {/* Filter and Google Sheets Export Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
                {(['ALL', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
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

              <div className="flex items-center gap-2">
                {/* Google Sheets Export Option */}
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen((prev) => !prev)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                    title="যেকোনো টেবিল ডেটা গুগল শীটে ডাউনলোড বা এক্সপোর্ট করার অপশন"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                    <span>গুগল শীটে ডাউনলোড</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        exportMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-40 animate-fade-in text-xs">
                      <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>Google Sheets ডাউনলোড</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          CSV / Sheets
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          downloadOrdersAsGoogleSheetsCSV(
                            filteredOrders,
                            `foody-rahat-orders-${statusFilter.toLowerCase()}`
                          );
                          setExportMenuOpen(false);
                          showToast('বর্তমান ফিল্টারকৃত টেবিল গুগল শীট (.csv) ফরম্যাটে ডাউনলোড হয়েছে!');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 text-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors group"
                      >
                        <Download className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="font-bold text-slate-900">বর্তমান টেবিল ডাউনলোড করুন</p>
                          <p className="text-[11px] text-slate-500">
                            {statusFilter === 'ALL'
                              ? `সকল (${filteredOrders.length})`
                              : `${statusFilter}(${filteredOrders.length})`}{' '}
                            টি ডেটা (.csv)
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          downloadOrdersAsGoogleSheetsCSV(orders, 'foody-rahat-all-orders');
                          setExportMenuOpen(false);
                          showToast('ডাটাবেজের সকল অর্ডার গুগল শীট (.csv) ফরম্যাটে ডাউনলোড হয়েছে!');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 text-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors group"
                      >
                        <Download className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="font-bold text-slate-900">সম্পূর্ণ ডাটাবেজ ডাউনলোড</p>
                          <p className="text-[11px] text-slate-500">
                            মোট {orders.length} টি সব অর্ডার (.csv)
                          </p>
                        </div>
                      </button>

                      <div className="my-1.5 border-t border-slate-100" />

                      <button
                        onClick={async () => {
                          const ok = await copyAndOpenGoogleSheets(filteredOrders, true);
                          setExportMenuOpen(false);
                          if (ok) {
                            showToast(
                              'টেবিল ডেটা কপি হয়েছে! ওপেন হওয়া sheets.new ট্যাবে Ctrl+V প্রেস করুন।'
                            );
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 text-slate-800 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors group"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="font-bold text-slate-900">Google Sheets-এ সরাসরি খুলুন</p>
                          <p className="text-[11px] text-slate-500">sheets.new ওপেন হবে ও পেস্ট হবে</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">রিফ্রেশ</span>
                </button>
              </div>
            </div>

            {/* Export Feedback Toast */}
            {exportToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{exportToast}</span>
                </div>
                <button
                  onClick={() => setExportToast(null)}
                  className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Orders Table */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>দেখানো হচ্ছে <strong className="text-slate-800">{toBengaliNumber(filteredOrders.length)}</strong> টি অর্ডার</span>
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  সব ফিল্টার মুছুন
                </button>
              )}
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-3 px-4">অর্ডার আইডি</th>
                    <th className="py-3 px-4">গ্রাহক ও মোবাইল</th>
                    <th className="py-3 px-4">ঠিকানা</th>
                    <th className="py-3 px-4">আইটেম</th>
                    <th className="py-3 px-4">মোট বিল</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        কোনো অর্ডার পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Order ID */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{order.id}
                        </td>

                        {/* Customer & Phone */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800 leading-tight">{order.customerName}</p>
                          <a
                            href={`tel:${order.phone}`}
                            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {order.phone}
                          </a>
                        </td>

                        {/* Address */}
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                          <p className="truncate">{order.address}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.deliveryAreaLabel}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4 text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {toBengaliNumber(
                              (order?.items || []).reduce((sum, i) => sum + (i?.quantity || 0), 0)
                            )}{' '}
                            বোতল
                          </span>
                          <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {(order?.items || []).map((i) => i.productTitle).join(', ')}
                          </p>
                        </td>

                        {/* Grand Total */}
                        <td className="py-3 px-4 font-bold text-slate-900">
                          ৳{toBengaliNumber(order.grandTotal)}
                        </td>

                        {/* Status Select */}
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderRecord['status'])
                            }
                            className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border outline-none cursor-pointer ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'PROCESSING'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : order.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="PENDING">অপেক্ষমাণ</option>
                            <option value="CONFIRMED">কনফার্মড</option>
                            <option value="PROCESSING">প্রসেসিং</option>
                            <option value="DELIVERED">ডেলিভারড</option>
                            <option value="CANCELLED">বাতিল</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Copy Courier Note */}
                            <button
                              onClick={() => handleCopyCourierNote(order)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="কুরিয়ার পার্সেল স্লিপ কপি করুন (Steadfast / Pathao)"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* WhatsApp Memo */}
                            <a
                              href={`https://wa.me/${
                                order.phone.replace(/[^0-9]/g, '').startsWith('88')
                                  ? order.phone.replace(/[^0-9]/g, '')
                                  : `88${order.phone.replace(/[^0-9]/g, '')}`
                              }?text=${encodeURIComponent(
                                `আসসালামু আলাইকুম ${order.customerName},\nFoody Rahat থেকে আপনার ফ্রেশ জুস অর্ডার (${order.id}) কনফার্ম হয়েছে।\nমোট প্রদেয়: ৳${order.grandTotal} (ক্যাশ অন ডেলিভারি)। দ্রুত আপনার ঠিকানায় পৌঁছে যাবে ইনশাআল্লাহ!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="গ্রাহককে হোয়াটসঅ্যাপে মেসেজ দিন"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                              title="অর্ডার মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Foody Rahat Official Shop Management System</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

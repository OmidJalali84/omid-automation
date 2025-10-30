"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

type OrderStatus = 'تحویل داده شده' | 'آماده تحویل' | 'در حال آماده‌سازی' | 'لغو شده';

type Order = {
  orderId: string;
  date: string;
  time: string;
  mealType: 'صبحانه' | 'ناهار' | 'شام';
  restaurant: string;
  status: OrderStatus;
  totalPrice: number;
  paidAmount: number;
  items: Array<{ name: string; qty: number }>;
};

const statusConfig: Record<OrderStatus, { color: string; bgClass: string; textClass: string; borderClass: string; icon: string }> = {
  'تحویل داده شده': {
    color: 'emerald',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    icon: '✓'
  },
  'آماده تحویل': {
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/20',
    icon: '🔔'
  },
  'در حال آماده‌سازی': {
    color: 'yellow',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/20',
    icon: '⏳'
  },
  'لغو شده': {
    color: 'red',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/20',
    icon: '✕'
  }
};

// Mock Orders Data
const mockOrdersData: Record<string, Order[]> = {
  '401111111': [
    {
      orderId: 'ORD-2024-001240',
      date: '1403/08/09',
      time: '12:30',
      mealType: 'ناهار',
      restaurant: 'امیرالمومنین',
      status: 'در حال آماده‌سازی',
      totalPrice: 120000,
      paidAmount: 50000,
      items: [
        { name: 'چلوکباب کوبیده', qty: 1 },
        { name: 'نوشابه', qty: 1 }
      ]
    }
  ],
  '401222222': [
    {
      orderId: 'ORD-2024-001234',
      date: '1403/08/09',
      time: '07:45',
      mealType: 'صبحانه',
      restaurant: 'امیرالمومنین',
      status: 'تحویل داده شده',
      totalPrice: 75000,
      paidAmount: 0,
      items: [
        { name: 'نان و پنیر', qty: 1 },
        { name: 'چای', qty: 1 }
      ]
    },
    {
      orderId: 'ORD-2024-001230',
      date: '1403/08/08',
      time: '19:20',
      mealType: 'شام',
      restaurant: 'امیرالمومنین',
      status: 'تحویل داده شده',
      totalPrice: 95000,
      paidAmount: 25000,
      items: [
        { name: 'زرشک پلو با مرغ', qty: 1 }
      ]
    }
  ],
  '401333333': [
    {
      orderId: 'ORD-2024-001237',
      date: '1403/08/09',
      time: '18:45',
      mealType: 'شام',
      restaurant: 'امیرالمومنین',
      status: 'تحویل داده شده',
      totalPrice: 110000,
      paidAmount: 40000,
      items: [
        { name: 'قیمه نثار', qty: 1 },
        { name: 'دوغ', qty: 1 }
      ]
    },
    {
      orderId: 'ORD-2024-001236',
      date: '1403/08/09',
      time: '12:15',
      mealType: 'ناهار',
      restaurant: 'امیرالمومنین',
      status: 'تحویل داده شده',
      totalPrice: 105000,
      paidAmount: 35000,
      items: [
        { name: 'چلو خورش قیمه', qty: 1 }
      ]
    },
    {
      orderId: 'ORD-2024-001235',
      date: '1403/08/09',
      time: '07:30',
      mealType: 'صبحانه',
      restaurant: 'امیرالمومنین',
      status: 'تحویل داده شده',
      totalPrice: 75000,
      paidAmount: 0,
      items: [
        { name: 'صبحانه کامل', qty: 1 }
      ]
    }
  ],
  '401444444': [
    {
      orderId: 'ORD-2024-001220',
      date: '1403/08/07',
      time: '12:45',
      mealType: 'ناهار',
      restaurant: 'رستوران کاکتوس',
      status: 'لغو شده',
      totalPrice: 150000,
      paidAmount: 0,
      items: [
        { name: 'چلوکباب', qty: 1 }
      ]
    }
  ],
  '401555555': []
};

export default function OrdersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const studentId = localStorage.getItem('currentStudentId') || '401222222';
      const orders = mockOrdersData[studentId] || [];
      setCurrentUser({ studentId, orders });
    }
  }, []);

  const user = currentUser || { studentId: '401234567' };
  const allOrders: Order[] = currentUser?.orders || [];

  const activeOrders = allOrders.filter(order => 
    order.status === 'در حال آماده‌سازی' || order.status === 'آماده تحویل'
  );
  const historyOrders = allOrders.filter(order => 
    order.status === 'تحویل داده شده' || order.status === 'لغو شده'
  );

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentStudentId');
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <span className="text-white text-xl">🍴</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">سفارشات من</h1>
                <p className="text-slate-400 text-xs">تاریخچه و وضعیت سفارشات</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors text-sm font-medium border border-slate-700/50"
              >
                داشبورد
              </Link>
              <button
                aria-label="menu"
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 border border-slate-700/50 text-white"
              >
                <span className="text-2xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700/50 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">منو</h2>
              <button aria-label="close" onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-white">✕</button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/dashboard" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">داشبورد</Link>
              <Link href="/free-order" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">سفارش آزاد</Link>
              <Link href="/orders" className="px-4 py-3 rounded-xl text-white bg-slate-800 border border-emerald-500/50">سفارش‌های من</Link>
            </nav>

            <div className="mt-auto">
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
              >
                خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl rounded-2xl p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📦</span>
              <span className="text-2xl font-bold text-emerald-400">{allOrders.length}</span>
            </div>
            <p className="text-slate-300 text-sm">کل سفارشات</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">⏳</span>
              <span className="text-2xl font-bold text-blue-400">{activeOrders.length}</span>
            </div>
            <p className="text-slate-300 text-sm">سفارشات فعال</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✓</span>
              <span className="text-2xl font-bold text-purple-400">{historyOrders.length}</span>
            </div>
            <p className="text-slate-300 text-sm">تحویل شده</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 mb-6 border border-slate-700/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              سفارشات فعال ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              تاریخچه ({historyOrders.length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {displayOrders.length > 0 ? (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const config = statusConfig[order.status];
              return (
                <div
                  key={order.orderId}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
                >
                  {/* Order Header */}
                  <div className="p-5 border-b border-slate-700/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-lg">{order.mealType}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} border ${config.borderClass}`}>
                            {config.icon} {order.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{order.restaurant}</p>
                      </div>
                      <Link
                        href={`/order-detail/${order.orderId}`}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        جزئیات
                      </Link>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        {order.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🕐</span>
                        {order.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🆔</span>
                        {order.orderId}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 bg-slate-900/30">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-slate-500">× {item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-700/30 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">مبلغ کل:</span>
                        <span className="text-white font-semibold">{order.totalPrice.toLocaleString()} تومان</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">مبلغ پرداختی:</span>
                        <span className={order.paidAmount > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                          {order.paidAmount.toLocaleString()} تومان
                        </span>
                      </div>
                      {order.paidAmount === 0 && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                          <span>✓</span>
                          <span>با ژتون پرداخت شده</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50 text-center">
            <span className="text-6xl mb-4 block">
              {activeTab === 'active' ? '📦' : '📋'}
            </span>
            <h3 className="text-white text-xl font-bold mb-2">
              {activeTab === 'active' ? 'سفارش فعالی وجود ندارد' : 'تاریخچه‌ای یافت نشد'}
            </h3>
            <p className="text-slate-400">
              {activeTab === 'active' 
                ? 'هنوز سفارش جدیدی ثبت نکرده‌اید'
                : 'هیچ سفارش قبلی در سیستم ثبت نشده است'
              }
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30"
            >
              بازگشت به داشبورد
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
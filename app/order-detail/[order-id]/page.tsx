"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = String(params?.orderId || '');
  const [showQR, setShowQR] = useState(false);

  // دیتای نمونه سفارش
  const orderDetails = {
    orderId: orderId,
    mealType: 'صبحانه',
    restaurant: 'امیرالمومنین',
    date: '1403/08/09',
    time: '07:30',
    status: 'تحویل داده شده',
    items: [
      { name: 'نان و پنیر', qty: 1 },
      { name: 'چای', qty: 1 },
      { name: 'عسل', qty: 1 }
    ],
    totalPrice: 75000,
    paidAmount: 0,
    jettonUsed: true
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🍴</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">جزئیات سفارش</h1>
                <p className="text-slate-400 text-xs">کد: {orderId}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors text-sm font-medium border border-slate-700/50"
            >
              بازگشت
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/50">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">سفارش تحویل داده شد</h2>
          <p className="text-slate-400">این سفارش با موفقیت تحویل گرفته شده است</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            اطلاعات سفارش
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
              <span className="text-slate-400">شماره سفارش:</span>
              <span className="text-white font-mono font-semibold">{orderDetails.orderId}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
              <span className="text-slate-400">نوع وعده:</span>
              <span className="text-white font-semibold">{orderDetails.mealType}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
              <span className="text-slate-400">رستوران:</span>
              <span className="text-white font-semibold">{orderDetails.restaurant}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
              <span className="text-slate-400">تاریخ:</span>
              <span className="text-white font-semibold">{orderDetails.date}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-700/30">
              <span className="text-slate-400">ساعت تحویل:</span>
              <span className="text-white font-semibold">{orderDetails.time}</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400">وضعیت:</span>
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/20">
                {orderDetails.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            اقلام سفارش
          </h3>

          <div className="space-y-3">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-700/30 rounded-xl p-4">
                <span className="text-white">{item.name}</span>
                <span className="text-slate-400">× {item.qty}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700/50 mt-6 pt-4 space-y-3">
            <div className="flex justify-between text-slate-300">
              <span>مبلغ کل:</span>
              <span className="font-bold">{orderDetails.totalPrice.toLocaleString()} تومان</span>
            </div>
            {orderDetails.jettonUsed && (
              <div className="flex justify-between text-emerald-400">
                <span>ژتون استفاده شده:</span>
                <span className="font-bold">✓</span>
              </div>
            )}
            <div className="flex justify-between text-white text-lg font-bold bg-slate-700/30 rounded-xl p-3">
              <span>مبلغ پرداختی:</span>
              <span>{orderDetails.paidAmount.toLocaleString()} تومان</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            کد سفارش
          </h3>

          <div className="bg-white rounded-2xl p-8 mb-4">
            <div className="aspect-square max-w-[280px] mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
              {showQR ? (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-6xl">⬛</span>
                    </div>
                    <p className="text-slate-600 text-sm">QR Code</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowQR(true)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <div className="text-center">
                    <span className="text-6xl block mb-2">👆</span>
                    <p className="text-sm">برای نمایش کد کلیک کنید</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">کد پیگیری:</p>
            <code className="text-emerald-400 font-mono text-lg bg-slate-900/50 px-4 py-2 rounded-lg inline-block">
              {orderId}
            </code>
          </div>
        </div>

        {/* Help Box */}
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/20 mb-6">
          <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            راهنما
          </h3>
          <p className="text-blue-300/80 text-sm leading-relaxed">
            این سفارش قبلاً تحویل داده شده است. در صورت نیاز به بررسی مجدد، می‌توانید از کد پیگیری استفاده کنید.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-center transition-all shadow-lg shadow-emerald-500/30"
          >
            مشاهده همه سفارشات
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium text-center transition-colors"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </main>
    </div>
  );
}
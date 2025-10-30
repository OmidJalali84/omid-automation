"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type OrderItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type OrderData = {
  restaurant: string;
  restaurantId: string;
  items: OrderItem[];
  total: number;
  jettonWorth: number;
  payable: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // خواندن دیتا از sessionStorage
    const storedData = sessionStorage.getItem('checkoutOrder');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setOrderData(parsed);
      } catch (error) {
        console.error('Error parsing order data:', error);
        router.push('/dashboard');
      }
    } else {
      // اگر دیتایی نیست، به داشبورد برگرد
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const handlePayment = () => {
    setTimeout(() => {
      setShowSuccess(true);
      // پاک کردن دیتای سفارش بعد از پرداخت
      sessionStorage.removeItem('checkoutOrder');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
            {/* Success Animation */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-5xl">✓</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">سفارش با موفقیت ثبت شد!</h1>
            <p className="text-slate-400 mb-8">
              سفارش شما ثبت و به رستوران ارسال شد. کد QR سفارش برای شما ارسال می‌شود.
            </p>

            {/* Order Summary */}
            <div className="bg-slate-700/30 rounded-2xl p-4 mb-6 text-right">
              <div className="flex justify-between text-slate-300 mb-2">
                <span>رستوران:</span>
                <span className="font-bold text-white">{orderData.restaurant}</span>
              </div>
              <div className="flex justify-between text-slate-300 mb-2">
                <span>تعداد آیتم:</span>
                <span className="font-bold text-white">{orderData.items.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>مبلغ پرداختی:</span>
                <span className="font-bold text-emerald-400">{orderData.payable.toLocaleString()} تومان</span>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="w-48 h-48 bg-slate-200 mx-auto rounded-xl flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
              <p className="text-slate-600 text-sm mt-4">
                کد QR سفارش شما
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4 mb-6 text-right">
              <h3 className="text-white font-bold mb-3">راهنما</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                پس از پرداخت، کد و QR سفارش شما صادر می‌شود.
                هنگام مراجعه به رستوران، صرفاً کد یا QR را ارائه کنید.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
              >
                مشاهده سفارشات من
              </Link>
              <Link
                href="/dashboard"
                className="block w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium transition-colors"
              >
                بازگشت به داشبورد
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-white font-bold text-lg">تایید سفارش</h1>
                <p className="text-slate-400 text-xs">{orderData.restaurant}</p>
              </div>
            </div>
            <Link
              href={`/free-order/${orderData.restaurantId}`}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-colors text-sm font-medium border border-slate-700/50"
            >
              بازگشت
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                خلاصه سفارش
              </h2>

              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-slate-700/30 rounded-xl p-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-600/50 to-slate-500/30 rounded-xl flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-slate-400 text-sm">تعداد: {item.qty}</p>
                    </div>
                    <p className="text-emerald-400 font-bold">
                      {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700/50 mt-6 pt-4 space-y-3">
                <div className="flex justify-between text-white">
                  <span>جمع سبد</span>
                  <span className="font-bold">{orderData.total.toLocaleString()} تومان</span>
                </div>
                {orderData.jettonWorth > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>ارزش ژتون</span>
                    <span className="font-bold">-{orderData.jettonWorth.toLocaleString()} تومان</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-lg font-bold bg-slate-700/30 rounded-xl p-3">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{orderData.payable.toLocaleString()} تومان</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/20">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                راهنما
              </h3>
              <p className="text-blue-300/80 text-sm leading-relaxed">
                پس از پرداخت، کد و QR سفارش شما صادر می‌شود.
                هنگام مراجعه به رستوران، صرفاً کد یا QR را ارائه کنید.
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                روش پرداخت
              </h2>

              <div className="space-y-3">
                {/* Wallet Payment - Disabled */}
                <button
                  disabled
                  className="w-full p-4 rounded-xl border-2 border-slate-700/30 bg-slate-700/10 transition-all text-right opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale">💰</span>
                      <div>
                        <p className="text-slate-500 font-semibold">کیف پول دانشجویی</p>
                        <p className="text-slate-600 text-sm">غیرفعال - موجودی: 0 تومان</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700/50 bg-slate-800/50">
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">✕</div>
                    </div>
                  </div>
                </button>

                {/* Online Payment */}
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                    paymentMethod === 'online'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700/50 bg-slate-700/20 hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="text-white font-semibold">پرداخت آنلاین</p>
                        <p className="text-slate-400 text-sm">درگاه بانکی</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'online'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'online' && (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              پرداخت {orderData.payable > 0 ? orderData.payable.toLocaleString() + ' تومان' : 'و ثبت سفارش'}
            </button>

            <Link
              href={`/free-order/${orderData.restaurantId}`}
              className="block w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-4 rounded-xl font-medium text-center transition-colors"
            >
              بازگشت به منو
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
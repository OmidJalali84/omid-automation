"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { restaurants, type RestaurantKey } from '../data/restaurants';

export default function FreeOrderRestaurantPage() {
  const jettonWorth = 70000;

  type Category = 'برنجی' | 'نوشیدنی' | 'سالاد';
  const categories: Category[] = ['برنجی', 'نوشیدنی', 'سالاد'];
  type MenuItem = { id: number; name: string; price: number; image: string; available: boolean };
  const [activeCategory, setActiveCategory] = useState<Category>('برنجی');
  const params = useParams();
  const router = useRouter();
  const key = String(params?.slug || '') as RestaurantKey;
  const restaurant = restaurants[key];

  const [cart, setCart] = useState<Record<number, number>>({});

  const scrollToCategory = (category: Category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const offset = 180; // Account for sticky header and category pills
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveCategory(category);
    }
  };

  // Detect which category is in view while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const cat of categories) {
        const element = document.getElementById(`category-${cat}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(cat);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) => setCart(prev => {
    const next = { ...prev };
    if (next[id] > 0) {
      next[id] -= 1;
      if (next[id] === 0) delete next[id];
    }
    return next;
  });

  const items = restaurant?.items || {};
  
  // Get all items from all categories
  const allItems = Object.values(items).flat() as MenuItem[];
  
  const getCartTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = allItems.find((i: MenuItem) => i.id === parseInt(itemId));
      if (item) total += item.price * (qty as number);
    });
    return total;
  };

  const cartItems: Array<MenuItem & { qty: number }> = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = allItems.find((i: MenuItem) => i.id === parseInt(itemId));
      return item ? { ...item, qty: qty as number } : null;
    })
    .filter(Boolean) as Array<MenuItem & { qty: number }>;

  const total = getCartTotal();
  const payable = Math.max(0, total - jettonWorth);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // ذخیره اطلاعات سفارش در sessionStorage
    const orderData = {
      restaurant: restaurant.name,
      restaurantId: key,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image
      })),
      total,
      jettonWorth,
      payable
    };

    sessionStorage.setItem('checkoutOrder', JSON.stringify(orderData));
    router.push('/checkout');
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        رستوران یافت نشد
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
                <h1 className="text-white font-bold text-lg">دانشگاه صنعتی سهند</h1>
                <p className="text-slate-400 text-xs">سامانه رزرو و سفارش غذا</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-40 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Section */}
          <div className="flex-1">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 mb-4 mt-4">
              <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
              <p className="text-slate-400">{restaurant.description}</p>
            </div>

            {/* Category Pills */}
            <div className="sticky top-16 z-40 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2 mb-4 border border-slate-700/50">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items by Category */}
            {categories.map((cat) => (
              <div key={cat} id={`category-${cat}`} className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(items[cat] || []).map((item) => (
                    <div
                      key={item.id}
                      className={`bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border ${
                        item.available
                          ? 'border-slate-700/50 hover:border-emerald-500/50'
                          : 'border-slate-700/30 opacity-60'
                      } transition-all duration-300`}
                    >
                      {/* Image */}
                      <div className="w-full h-32 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-xl flex items-center justify-center text-6xl mb-4">
                        {item.image}
                      </div>

                      {/* Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                          <p className="text-emerald-400 font-bold text-lg">
                            {item.price.toLocaleString()} تومان
                          </p>
                        </div>
                        {!item.available && (
                          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20">
                            ناموجود
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={!item.available || !cart[item.id]}
                          className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors flex items-center justify-center"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-white font-bold text-lg">
                            {cart[item.id] || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(item.id)}
                          disabled={!item.available}
                          className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar - Desktop Only */}
          <div className="w-full lg:w-96 hidden lg:block">
            <div className="sticky top-20 bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                سبد خرید
              </h2>

              {cartItems.length > 0 ? (
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-slate-400 text-xs">× {item.qty}</p>
                        </div>
                      </div>
                      <p className="text-emerald-400 font-bold text-sm">
                        {(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <span className="text-4xl block mb-2">🍽️</span>
                  <p className="text-sm">سبد خرید خالی است</p>
                </div>
              )}

              <div className="border-t border-slate-700/50 pt-4 space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>جمع سبد</span>
                  <span className="font-bold">{total.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>ارزش ژتون</span>
                  <span className="font-bold">{jettonWorth.toLocaleString()} تومان</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="font-bold">{payable.toLocaleString()} تومان</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  پرداخت و ثبت سفارش
                </button>
                <Link
                  href="/dashboard"
                  className="block w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 rounded-xl font-medium text-center transition-colors"
                >
                  بازگشت به داشبورد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Checkout Button - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50">
        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
        >
          پرداخت و ثبت سفارش {cartItems.length > 0 && `(${payable.toLocaleString()} تومان)`}
        </button>
      </div>
    </div>
  );
}
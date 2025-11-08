"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { restaurants, type RestaurantKey } from "../data/restaurants";

export default function FreeOrderRestaurantPage() {
  const jettonValue = 70000; // ارزش هر ژتون

  type Category = "غذای ایرانی" | "فست فود" | "پیتزا" | "صبحانه";
  const categories: Category[] = ["غذای ایرانی", "فست فود", "پیتزا", "صبحانه"];
  type MenuItem = {
    id: number;
    name: string;
    price: number;
    image: string;
    available: boolean;
    category: Category;
  };
  const [activeCategory, setActiveCategory] = useState<Category>("غذای ایرانی");
  const params = useParams();
  const router = useRouter();
  const key = String(params?.slug || "") as RestaurantKey;
  const restaurant = restaurants[key];

  const [cart, setCart] = useState<Record<number, number>>({});
  const [jettonAllocations, setJettonAllocations] = useState<
    Record<number, number>
  >({}); // itemId -> jetton count
  const [availableJettons, setAvailableJettons] = useState(3); // تعداد ژتون‌های موجود دانشجو
  const [showJettonModal, setShowJettonModal] = useState(false);

  const scrollToCategory = (category: Category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const offset = 180;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveCategory(category);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const cat of categories) {
        const element = document.getElementById(`category-${cat}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveCategory(cat);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const addToCart = (id: number) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const removeFromCart = (id: number) =>
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 0) {
        next[id] -= 1;
        // اگر تعداد کاهش یافت، ژتون‌های تخصیص داده شده را هم کاهش بده
        if (jettonAllocations[id] > next[id]) {
          setJettonAllocations((prevJettons) => ({
            ...prevJettons,
            [id]: Math.min(prevJettons[id] || 0, next[id]),
          }));
        }
        if (next[id] === 0) {
          delete next[id];
          // حذف ژتون‌های تخصیص داده شده
          setJettonAllocations((prevJettons) => {
            const newJettons = { ...prevJettons };
            delete newJettons[id];
            return newJettons;
          });
        }
      }
      return next;
    });

  const items = restaurant?.items || {};
  const allItems = Object.entries(items).flatMap(([category, itemList]) =>
    (itemList as MenuItem[]).map((item) => ({
      ...item,
      category: category as Category,
    }))
  );

  // محاسبه تعداد ژتون‌های استفاده شده
  const usedJettons = Object.values(jettonAllocations).reduce(
    (sum, count) => sum + count,
    0
  );
  const remainingJettons = availableJettons - usedJettons;

  // افزودن/کاهش ژتون برای یک آیتم
  const adjustJetton = (itemId: number, change: number) => {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    // فقط برای غذاها (نه نوشیدنی)
    const foodCategories: Category[] = [
      "غذای ایرانی",
      "فست فود",
      "پیتزا",
      "صبحانه",
    ];
    if (!foodCategories.includes(item.category)) {
      return;
    }

    const currentQty = cart[itemId] || 0;
    const currentJettons = jettonAllocations[itemId] || 0;
    const newJettons = currentJettons + change;

    // نمی‌تواند بیشتر از تعداد سفارش باشد
    if (newJettons > currentQty) return;
    // نمی‌تواند منفی باشد
    if (newJettons < 0) return;
    // نمی‌تواند بیشتر از ژتون‌های موجود باشد
    if (change > 0 && remainingJettons <= 0) return;

    setJettonAllocations((prev) => ({
      ...prev,
      [itemId]: newJettons,
    }));
  };

  const getCartTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = allItems.find((i: MenuItem) => i.id === parseInt(itemId));
      if (item) total += item.price * (qty as number);
    });
    return total;
  };

  const getJettonDiscount = () => {
    return usedJettons * jettonValue;
  };

  const cartItems: Array<MenuItem & { qty: number }> = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = allItems.find((i: MenuItem) => i.id === parseInt(itemId));
      return item ? { ...item, qty: qty as number } : null;
    })
    .filter(Boolean) as Array<MenuItem & { qty: number }>;

  const total = getCartTotal();
  const jettonDiscount = getJettonDiscount();
  const payable = Math.max(0, total - jettonDiscount);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const orderData = {
      restaurant: restaurant.name,
      restaurantId: key,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        jettonsUsed: jettonAllocations[item.id] || 0,
      })),
      total,
      jettonWorth: jettonDiscount,
      jettonsRequired: usedJettons,
      payable,
    };

    sessionStorage.setItem("checkoutOrder", JSON.stringify(orderData));
    router.push("/checkout");
  };

  // بررسی آیا آیتم می‌تواند ژتون بگیرد
  const canUseJetton = (item: MenuItem) => {
    const foodCategories: Category[] = [
      "غذای ایرانی",
      "فست فود",
      "پیتزا",
      "صبحانه",
    ];
    return foodCategories.includes(item.category);
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
                <h1 className="text-white font-bold text-lg">
                  دانشگاه صنعتی سهند
                </h1>
                <p className="text-slate-400 text-xs">
                  سامانه رزرو و سفارش غذا
                </p>
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
              <h1 className="text-3xl font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <p className="text-slate-400">{restaurant.description}</p>
            </div>

            {/* Jetton Info Banner */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl p-4 mb-4 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎫</span>
                  <div>
                    <p className="text-yellow-400 font-bold">ژتون‌های شما</p>
                    <p className="text-yellow-300/70 text-xs">
                      هر ژتون = {jettonValue.toLocaleString()} تومان • فقط برای
                      غذا
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <button
                    onClick={() => setShowJettonModal(true)}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors text-sm font-medium border border-yellow-500/30"
                  >
                    تغییر: {availableJettons} ژتون
                  </button>
                </div>
              </div>
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
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
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
                  {(items[cat] || []).map((item) => {
                    const itemWithCategory = { ...item, category: cat };
                    const canGetJetton = canUseJetton(itemWithCategory);
                    const itemJettons = jettonAllocations[item.id] || 0;
                    const itemQty = cart[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className={`bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border ${
                          item.available
                            ? "border-slate-700/50 hover:border-emerald-500/50"
                            : "border-slate-700/30 opacity-60"
                        } transition-all duration-300`}
                      >
                        {/* Image */}
                        <div className="w-full h-32 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-xl flex items-center justify-center text-6xl mb-4">
                          {item.image}
                        </div>

                        {/* Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-1">
                              {item.name}
                            </h3>
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
                        <div className="flex items-center gap-2 mb-3">
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

                        {/* Jetton Allocation */}
                        {canGetJetton && itemQty > 0 && (
                          <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-yellow-400 text-xs font-medium">
                                استفاده از ژتون (حداکثر {itemQty})
                              </span>
                              <span className="text-yellow-400 text-xs">
                                🎫 {itemJettons}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => adjustJetton(item.id, -1)}
                                disabled={itemJettons === 0}
                                className="w-8 h-8 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-yellow-400 rounded-lg font-bold text-sm transition-colors flex items-center justify-center"
                              >
                                -
                              </button>
                              <div className="flex-1">
                                <div className="bg-slate-700/30 rounded-lg h-2 overflow-hidden">
                                  <div
                                    className="bg-yellow-400 h-full transition-all"
                                    style={{
                                      width: `${
                                        (itemJettons / itemQty) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => adjustJetton(item.id, 1)}
                                disabled={
                                  itemJettons >= itemQty ||
                                  remainingJettons <= 0
                                }
                                className="w-8 h-8 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-yellow-400 rounded-lg font-bold text-sm transition-colors flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            {itemJettons > 0 && (
                              <p className="text-yellow-300/70 text-xs mt-2 text-center">
                                تخفیف:{" "}
                                {(itemJettons * jettonValue).toLocaleString()}{" "}
                                تومان
                              </p>
                            )}
                          </div>
                        )}
                        {!canGetJetton && itemQty > 0 && (
                          <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                            <p className="text-slate-400 text-xs">
                              ژتون برای این آیتم قابل استفاده نیست
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

              {/* Jetton Status */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl p-4 mb-4 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 font-bold text-sm">
                      ژتون‌های استفاده شده
                    </p>
                    <p className="text-yellow-300/70 text-xs">
                      {remainingJettons} عدد باقی‌مانده
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    {usedJettons}/{availableJettons}
                  </span>
                </div>
              </div>

              {cartItems.length > 0 ? (
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => {
                    const itemJettons = jettonAllocations[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-700/30 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.image}</span>
                            <div>
                              <p className="text-white text-sm font-medium">
                                {item.name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                × {item.qty}
                              </p>
                            </div>
                          </div>
                          <p className="text-emerald-400 font-bold text-sm">
                            {(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                        {itemJettons > 0 && (
                          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-2 py-1">
                            <span>🎫</span>
                            <span>{itemJettons} ژتون استفاده شد</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  <span className="font-bold">
                    {total.toLocaleString()} تومان
                  </span>
                </div>
                {jettonDiscount > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>تخفیف ژتون ({usedJettons} عدد)</span>
                    <span className="font-bold">
                      -{jettonDiscount.toLocaleString()} تومان
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="font-bold">
                    {payable.toLocaleString()} تومان
                  </span>
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

      {/* Mobile Checkout Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 z-50">
        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
        >
          پرداخت و ثبت سفارش{" "}
          {cartItems.length > 0 && `(${payable.toLocaleString()} تومان)`}
        </button>
      </div>

      {/* Jetton Count Modal */}
      {showJettonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowJettonModal(false)}
          />
          <div className="relative w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">
              تعداد ژتون‌های شما
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              چند ژتون برای این سفارش دارید؟
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() =>
                  setAvailableJettons(Math.max(0, availableJettons - 1))
                }
                className="w-12 h-12 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl font-bold text-2xl transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-5xl font-bold text-yellow-400">
                  {availableJettons}
                </span>
                <p className="text-yellow-300/70 text-sm mt-1">ژتون</p>
              </div>
              <button
                onClick={() => setAvailableJettons(availableJettons + 1)}
                className="w-12 h-12 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl font-bold text-2xl transition-colors"
              >
                +
              </button>
            </div>

            <div className="bg-yellow-500/10 rounded-xl p-4 mb-6 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm text-center">
                ارزش کل: {(availableJettons * jettonValue).toLocaleString()}{" "}
                تومان
              </p>
            </div>

            <button
              onClick={() => setShowJettonModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
            >
              تایید
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

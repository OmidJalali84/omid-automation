"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // دیتای نمونه
  const user = {
    name: 'محمد احمدی',
    studentId: '401234567',
    avatar: 'م'
  };

  const todayMeals = [
    {
      id: 1,
      type: 'صبحانه',
      restaurant: 'امیرالمومنین',
      status: 'ثبت شد',
      statusColor: 'emerald',
      time: '07:00 - 09:00',
      menu: 'مشاهده منو',
      action: 'مشاهده سفارش'
    },
    {
      id: 2,
      type: 'ناهار',
      restaurant: 'رستوران کاکتوس',
      status: 'خارج از برنامه',
      statusColor: 'blue',
      time: '12:00 - 14:00',
      menu: 'خارج از برنامه',
      action: 'آماده سفارش'
    },
    {
      id: 3,
      type: 'شام',
      restaurant: 'امیرالمومنین',
      status: 'آماده سفارش',
      statusColor: 'emerald',
      time: '18:00 - 20:00',
      menu: 'بلوار دانشگاه، جنب کتابخانه مرکزی',
      action: 'آماده سفارش'
    }
  ];

  const pastOrders = [
    { id: 1, count: 1, status: 'delivered' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <span className="text-white text-xl">🍴</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">دانشگاه صنعتی سهند</h1>
                <p className="text-slate-400 text-xs">سامانه رزرو و سفارش غذا</p>
              </div>
            </div>

            {/* Hamburger */}
            <div className="flex items-center">
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

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700/50 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">منو</h2>
              <button aria-label="close" onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-white">✕</button>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/50 rounded-2xl px-4 py-3 border border-slate-700/50">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                {user.avatar}
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <p className="text-slate-400 text-xs">دانشجو {user.studentId}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/dashboard" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">داشبورد</Link>
              <Link href="/free-order" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">سفارش آزاد</Link>
              <Link href="/orders" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">سفارش‌های من</Link>
              <Link href="/menu" className="px-4 py-3 rounded-xl text-white hover:bg-slate-800 border border-slate-700/50">منوی امروز</Link>
            </nav>

            <div className="mt-auto">
              <button className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20">خروج</button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="جستجو در رستوران‌ها و وعده‌ها"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          </div>
        </div>

        {/* Today's Meals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">رزروهای امروز</h2>
            <p className="text-slate-400 text-sm">سالن خوابگاه – امکان سه وعده</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="group relative bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                {/* Header with status indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-3xl"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{meal.type}</h3>
                    <p className="text-slate-400 text-sm">{meal.restaurant}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    meal.statusColor === 'emerald' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {meal.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <span className="text-lg">🕐</span>
                    <span>{meal.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <span className="text-lg">📍</span>
                    <span className="line-clamp-1">{meal.menu}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {meal.status === 'خارج از برنامه' ? (
                    <button className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-3 rounded-xl font-medium transition-colors border border-blue-500/20">
                      {meal.action}
                    </button>
                  ) : (
                    <Link
                      href={meal.action === 'مشاهده سفارش' ? '/orders' : '/menu'}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center"
                    >
                      {meal.action}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Past Orders Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">سفارش‌های ثبت‌شده امروز</h2>
            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium">{pastOrders.length}</span>
            </div>
          </div>

          {pastOrders.length > 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <p className="text-slate-300">شما {pastOrders.length} سفارش ثبت‌شده دارید</p>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 text-center">
              <span className="text-6xl mb-4 block">🍽️</span>
              <p className="text-slate-400 text-lg">هنوز سفارشی ثبت نشده است</p>
            </div>
          )}
        </section>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            در صورت هرگونه مشکل به پشتیبانی رفاهی دانشگاه اطلاع دهید.
          </p>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState } from 'react';
import Link from 'next/link';

type MealStatus = 'رزرو نشده' | 'خورده شده' | 'آماده سفارش' | 'خارج از وعده';

type StatusConfig = {
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  actionText: string;
  actionLink: string;
  disabled: boolean;
};

const statusConfigs: Record<MealStatus, StatusConfig> = {
  'آماده سفارش': {
    color: 'emerald',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    actionText: 'سفارش دهید',
    actionLink: '#',
    disabled: false
  },
  'خورده شده': {
    color: 'red',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/20',
    actionText: 'مشاهده سفارش',
    actionLink: '#',
    disabled: false
  },
  'خارج از وعده': {
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/20',
    actionText: 'سفارش آزاد',
    actionLink: '/free-order',
    disabled: false
  },
  'رزرو نشده': {
    color: 'gray',
    bgClass: 'bg-slate-700/10',
    textClass: 'text-slate-500',
    borderClass: 'border-slate-700/20',
    actionText: 'رزرو نشده',
    actionLink: '#',
    disabled: true
  }
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // بارگذاری اطلاعات کاربر
  useState(() => {
    if (typeof window !== 'undefined') {
      const studentId = localStorage.getItem('currentStudentId');
      // در پروژه واقعی از findUserByStudentId استفاده کنید
      // و دیتا رو از API بگیرید
      const mockUserData = {
        '4021101008': { name: 'المیرا تقی نسب', avatar: 'ا', meals: [
          { id: 1, type: 'صبحانه', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'خورده شده'as MealStatus, time: '07:30 - 09:30', location: 'سلف سرویس خوابگاه' , orderId: 'ORD-2024-001234'},
          { id: 2, type: 'ناهار', restaurant: 'رستوران کاکتوس',key: 'kaktus', status: 'آماده سفارش' as MealStatus, time: '11:45 - 15:15', location: 'جنب میدان عشق' },
          { id: 3, type: 'شام', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'خارج از وعده'  as MealStatus, time: '18:00 - 21:00', location: 'سلف سرویس خوابگاه' }
        ]},
        '401222222': { name: 'محمد رضایی', avatar: 'م', meals: [
          { id: 1, type: 'صبحانه', restaurant: 'امیرالمومنین',key: 'amiralmomenin',status: 'خورده شده' as MealStatus, time: '07:30 - 09:30', location: 'سلف سرویس خوابگاه', orderId: 'ORD-2024-001235' },
          { id: 2, type: 'ناهار', restaurant: 'رستوران کاکتوس',key: 'kaktus', status: 'خورده شده'  as MealStatus, time: '11:45 - 15:15', location: 'جنب میدان عشق' , orderId: 'ORD-2024-001236'},
          { id: 3, type: 'شام', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'آماده سفارش' as MealStatus, time: '18:00 - 21:00', location: 'سلف سرویس خوابگاه' }
        ]},
        '401333333': { name: 'زهرا کریمی', avatar: 'ز', meals: [
          { id: 1, type: 'صبحانه', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'خارج از وعده' as MealStatus, time: '07:30 - 09:30', location: 'سلف سرویس خوابگاه' },
          { id: 2, type: 'ناهار', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'خارج از وعده' as MealStatus, time: '11:45 - 15:15', location: 'سلف سرویس خوابگاه'},
          { id: 3, type: 'شام', restaurant: 'امیرالمومنین',key: 'amiralmomenin', status: 'خارج از وعده' as MealStatus, time: '18:00 - 21:00', location: 'سلف سرویس خوابگاه' }
        ]},
        '401444444': { name: 'فاطمه نوری', avatar: 'ف', meals: [
          { id: 1, type: 'صبحانه', restaurant: '-', status: 'رزرو نشده' as MealStatus, time: '07:30 - 09:30', location: '-' },
          { id: 2, type: 'ناهار', restaurant: 'رستوران کاکتوس',key: 'kaktus', status: 'خارج از وعده' as MealStatus, time: '11:45 - 15:15', location: 'جنب میدان عشق' },
          { id: 3, type: 'شام', restaurant: '-', status: 'رزرو نشده' as MealStatus, time: '18:00 - 21:00', location: '-' }
        ]},
        '401555555': { name: 'حسین محمدی', avatar: 'ح', meals: [
          { id: 1, type: 'صبحانه', restaurant: '-', status: 'خورده شده'as MealStatus, time: '07:30 - 09:30', location: '-' , orderId: 'ORD-2024-001237'},
          { id: 2, type: 'ناهار', restaurant: '-', status: 'خورده شده'as MealStatus, time: '11:45 - 15:15', location: '-' , orderId: 'ORD-2024-001238'},
          { id: 3, type: 'شام', restaurant: '-', status: 'خورده شده' as MealStatus, time: '18:00 - 21:00', location: '-', orderId: 'ORD-2024-001239' }
        ]}
      };
      const userData = mockUserData[studentId as keyof typeof mockUserData] || mockUserData['4021101008'];
      setCurrentUser({ studentId, ...userData });
    }
  });

  const user = currentUser || {
    studentId: '401234567',
    name: 'محمد احمدی',
    avatar: 'م'
  };

  const todayMeals = currentUser?.meals || [
    { id: 1, type: 'صبحانه', restaurant: 'امیرالمومنین', status: 'خورده شده' as MealStatus, time: '07:00 - 09:00', location: 'سلف سرویس خوابگاه', orderId: 'ORD-2024-001234' },
    { id: 2, type: 'ناهار', restaurant: 'رستوران کاکتوس', status: 'خارج از وعده' as MealStatus, time: '11:45 - 15:15', location: 'بلوار دانشگاه' },
    { id: 3, type: 'شام', restaurant: 'امیرالمومنین', status: 'آماده سفارش' as MealStatus, time: '18:00 - 21:00', location: 'سلف سرویس خوابگاه' }
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <span className="text-white text-xl">🍴</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">دانشگاه صنعتی سهند</h1>
                <p className="text-slate-400 text-xs">سامانه رزرو و سفارش غذا</p>
              </div>
            </div>

            <div className="flex items-center">
              <button
                aria-label="menue"
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 border border-slate-700/50 text-white"
              >
                <span className="text-2xl">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side menue */}
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
            </nav>

            <div className="mt-auto">
              <button className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20">خروج</button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Today's Meals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">رزروهای امروز</h2>
            <p className="text-slate-400 text-sm">سالن خوابگاه – امکان سه وعده</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayMeals.map((meal) => {
              const config = statusConfigs[meal.status];
              const isDisabled = config.disabled;
              
              return (
                <div
                  key={meal.id}
                  className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 ${
                    isDisabled 
                      ? 'border-slate-700/30 opacity-60' 
                      : 'border-slate-700/50 hover:border-' + config.color + '-500/50'
                  }`}
                >
                  {/* Top indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${
                    config.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                    config.color === 'red' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                    config.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    'bg-gradient-to-r from-slate-600 to-slate-700'
                  }`}></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${isDisabled ? 'text-slate-500' : 'text-white'}`}>
                        {meal.type}
                      </h3>
                      <p className={`text-sm ${isDisabled ? 'text-slate-600' : 'text-slate-400'}`}>
                        {meal.restaurant}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} border ${config.borderClass}`}>
                      {meal.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className={`flex items-center gap-2 text-sm ${isDisabled ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className="text-lg">🕐</span>
                      <span>{meal.time}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${isDisabled ? 'text-slate-600' : 'text-slate-300'}`}>
                      <span className="text-lg">📍</span>
                      <span className="line-clamp-1">{meal.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isDisabled ? (
                      <button
                        disabled
                        className={`flex-1 py-3 rounded-xl font-medium transition-colors border cursor-not-allowed ${config.bgClass} ${config.textClass} ${config.borderClass}`}
                      >
                        {config.actionText}
                      </button>
                    ) : meal.status === 'خورده شده' ? (
                      <Link
                        href={`/order-detail/${meal.orderId}`}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-medium transition-colors border border-red-500/20 text-center"
                      >
                        مشاهده سفارش
                      </Link>
                    ) : meal.status === 'آماده سفارش' ?(
                      (
                        <Link
                          href={`/menue/${meal.key}`}
                          className={'flex-1 py-3 rounded-xl font-medium transition-all shadow-lg text-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'}
                        >
                          {config.actionText}
                        </Link>
                      )
                    ): (
                      <Link
                      href={config.actionLink}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-lg text-center ${
                        config.color === 'emerald' 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
                          : config.color === 'blue'
                          ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-white'
                      }`}
                    >
                      {config.actionText}
                    </Link>
                    )}
                  </div>
                </div>
              );
            })}
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
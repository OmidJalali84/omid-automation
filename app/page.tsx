"use client";
import React, { useState } from "react";
import Link from "next/link";

const meals = [
  { id: 1, meal: "صبحانه", name: "املت تخم مرغ" },
  { id: 2, meal: "ناهار", name: "چلو جوجه کباب" },
  { id: 3, meal: "شام", name: "خورش قیمه" },
];

export default function StudentDashboard() {
  const [mealTab, setMealTab] = useState(1);
  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="relative rounded-2xl bg-gradient-to-tr from-indigo-500/40 via-blue-400/20 to-cyan-400/20 dark:from-indigo-900/40 dark:via-blue-800/20 dark:to-cyan-900/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 px-7 py-8 overflow-hidden border border-blue-300/20 dark:border-indigo-500/10">
        <div className="flex-1 min-w-[220px]">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-blue-100 mb-1 drop-shadow-lg">سلام 👋 دانشجوی عزیز</h2>
          <p className="text-blue-950/80 dark:text-blue-100/80 text-base font-medium">وضعیت رزرواسیون غذاهای امروز و ابزارهای سریع همینجاست!</p>
        </div>
        <div className="flex flex-col gap-2 items-center min-w-[210px]">
          <Link href="/menu" className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 px-7 py-2 rounded-xl text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition">رزرو غذای جدید</Link>
          <Link href="/orders" className="bg-white/80 hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold py-2 rounded-xl transition shadow-md mt-1 px-5">سفارش‌های من</Link>
        </div>
        {/* Blurred Glass Animation */}
        <div className="absolute -left-16 -top-16 w-40 h-40 bg-gradient-to-br from-blue-400/30 via-cyan-400/50 to-violet-500/20 blur-3xl rounded-full opacity-30 pointer-events-none animate-pulse-slow" />
      </div>
      {/* Tab for Meals (BreakFast/Lunch/Dinner) */}
      <div className="bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-xl border border-blue-200/30 p-6 flex flex-col gap-5 backdrop-blur-md">
        <div className="flex justify-center gap-4 mb-4">
          {meals.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setMealTab(tab.id)}
              className={
                "px-5 py-2 rounded-xl text-base font-bold transition " +
                (mealTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-violet-400 text-white shadow"
                  : "bg-transparent text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/60")
              }
            >
              {tab.meal}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Example card for demo purposes per meal */}
          <div className="w-full max-w-md mx-auto rounded-2xl bg-gradient-to-br from-blue-100/70 via-blue-50/60 to-cyan-100/60 dark:from-blue-900/30 dark:to-indigo-900/40 p-6 flex flex-col gap-3 shadow-xl border border-blue-100/30">
            <div className="flex items-center gap-4 mb-2">
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-400 to-violet-500 text-white text-2xl shadow">🍽️</span>
              <div>
                <h3 className="text-lg font-extrabold text-blue-800 dark:text-blue-200">{meals.find(t => t.id === mealTab)?.name}</h3>
                <p className="text-sm text-blue-700/60 dark:text-blue-100/50 font-medium">رستوران مرکزی - ۱۲:۳۰ تا ۱۴:۰۰</p>
              </div>
            </div>
            <div className="flex items-center gap-2 my-1">
              <span className="inline-flex items-center px-2 py-1 rounded-xl text-xs font-semibold bg-green-200 text-green-700">رزرو شما ثبت شده</span>
            </div>
            <Link href="/menu" className="mt-3 bg-gradient-to-l from-indigo-500 via-blue-500 to-cyan-400 hover:from-blue-600 hover:to-indigo-700 px-7 py-2.5 rounded-xl text-white font-bold text-base shadow-lg transition text-center">مشاهده منو</Link>
          </div>
        </div>
      </div>
      {/* Notice/Help Section */}
      <div className="rounded-2xl bg-gradient-to-l from-blue-300/10 via-indigo-100/30 to-violet-100/10 dark:from-blue-900/20 dark:via-blue-900/10 dark:to-violet-900/5 shadow-none text-blue-900/90 dark:text-gray-200 text-center text-base py-3 font-medium border border-blue-200/10">
        در صورت هرگونه مشکل با پشتیبانی رفاهی دانشگاه اطلاع دهید.
      </div>
    </div>
  );
}

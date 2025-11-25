"use client";

import Link from "next/link";
import { restaurantList } from "../../lib/data/restaurants";

export default function FreeOrderSelectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🍴</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">سفارش آزاد</h1>
              <p className="text-slate-400 text-xs">انتخاب رستوران</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl border border-slate-700/50 text-sm"
          >
            بازگشت
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurantList.map((r) => (
            <Link
              key={r.key}
              href={`/menu/${r.key}`}
              className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">{r.name}</h2>
                <span className="text-2xl">➡️</span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">
                {r.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

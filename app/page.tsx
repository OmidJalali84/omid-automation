"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // شبیه‌سازی ورود با mockUsers
      // در پروژه واقعی از authenticateUser استفاده کنید
      if (studentId && password === '1234') {
        // ذخیره studentId در localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentStudentId', studentId);
        }
        window.location.href = '/free-order';
      } else {
        setError('شماره دانشجویی یا رمز عبور اشتباه است');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/50">
            <span className="text-4xl">🍴</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">سامانه غذای دانشگاه</h1>
          <p className="text-slate-400">دانشگاه صنعتی سهند</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">ورود به سامانه</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                شماره دانشجویی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="401234567"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  👤
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900/50"
                />
                <span>مرا به خاطر بسپار</span>
              </label>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                فراموشی رمز عبور
              </a>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود به سامانه</span>
                  <span>←</span>
                </>
              )}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-slate-400">یا</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-sm">
              حساب کاربری ندارید؟{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                ثبت‌نام کنید
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm mb-3">
            برای ورود از شماره دانشجویی و رمز عبور خود استفاده کنید
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs mb-2">حساب‌های آزمایشی (رمز: 1234):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <code className="text-emerald-400 text-xs bg-slate-900/50 px-2 py-1 rounded">4021101008</code>
              <code className="text-emerald-400 text-xs bg-slate-900/50 px-2 py-1 rounded">4021101009</code>
              <code className="text-emerald-400 text-xs bg-slate-900/50 px-2 py-1 rounded">4021101010</code>
            </div>
          </div>
          <p className="text-slate-600 text-xs mt-3">
            در صورت بروز مشکل با پشتیبانی تماس بگیرید
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm">
          <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
            راهنما
          </a>
          <span className="text-slate-700">|</span>
          <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
            پشتیبانی
          </a>
          <span className="text-slate-700">|</span>
          <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
            قوانین
          </a>
        </div>
      </div>
    </div>
  );
}
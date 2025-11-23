"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token and restaurant info
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("restaurantId", data.restaurantId);
        localStorage.setItem("restaurantName", data.restaurantName);

        // Redirect to admin panel
        window.location.href = "/admin-panel";
      } else {
        setError(data.message || "نام کاربری یا رمز عبور اشتباه است");
      }
    } catch (err) {
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && username && password) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/50">
            <span className="text-white text-4xl">🍴</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            پنل مدیریت رستوران
          </h1>
          <p className="text-slate-400">
            سامانه رزرو و سفارش غذا - دانشگاه صنعتی سهند
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                نام کاربری
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="w-full pr-11 pl-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="w-full pr-11 pl-12 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
            >
              {isLoading ? "در حال ورود..." : "ورود به پنل"}
            </button>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-6">
            <p className="text-slate-400 text-xs mb-2">حساب‌های آزمایشی:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <code className="text-emerald-400 text-xs bg-slate-900/50 px-2 py-1 rounded">
                Amiral2025!
              </code>
              <code className="text-emerald-400 text-xs bg-slate-900/50 px-2 py-1 rounded">
                amiralmomenin_admin
              </code>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300/80">
                <p className="font-semibold mb-1">اطلاعات مهم:</p>
                <ul className="space-y-1 text-xs">
                  <li>• نام کاربری و رمز عبور توسط مدیر سیستم ارائه می‌شود</li>
                  <li>• در صورت فراموشی رمز عبور با پشتیبانی تماس بگیرید</li>
                  <li>• هرگز اطلاعات خود را با دیگران به اشتراک نگذارید</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            © 2025 دانشگاه صنعتی سهند - تمامی حقوق محفوظ است
          </p>
        </div>
      </div>
    </div>
  );
}

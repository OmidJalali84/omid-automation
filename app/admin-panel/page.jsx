// app/admin-panel/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Camera,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  BarChart3,
  DollarSign,
  RefreshCw,
} from "lucide-react";

const mockMenuItems = [
  {
    id: 1,
    name: "چلوکباب کوبیده",
    price: 160000,
    category: "غذای ایرانی",
    available: true,
    image: "🍖",
  },
  {
    id: 2,
    name: "زرشکپلو با مرغ",
    price: 145000,
    category: "غذای ایرانی",
    available: true,
    image: "🍗",
  },
  {
    id: 3,
    name: "چلو جوجه",
    price: 130000,
    category: "غذای ایرانی",
    available: true,
    image: "🍗",
  },
  {
    id: 4,
    name: "چلو تاوا کبابی",
    price: 210000,
    category: "غذای ایرانی",
    available: false,
    image: "🍖",
  },
  {
    id: 5,
    name: "نوشابه",
    price: 25000,
    category: "نوشیدنی",
    available: true,
    image: "🥤",
  },
  {
    id: 6,
    name: "دوغ",
    price: 20000,
    category: "نوشیدنی",
    available: true,
    image: "🥛",
  },
];

export default function RestaurantAdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    readyOrders: orders.filter((o) => o.status === "ready").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.paid, 0),
    totalSales: orders.reduce((sum, o) => sum + o.total, 0),
  };

  const handleScan = () => {
    const order = orders.find((o) => o.id === scanInput);
    if (order) {
      setSelectedOrder(order);
    } else {
      alert("سفارش یافت نشد");
    }
    setScanInput("");
  };

  const handleDeliverOrder = (orderId) => {
    updateOrderStatus(orderId, "delivered");
    setSelectedOrder(null);
    setScannerOpen(false);
  };

  const toggleItemAvailability = (itemId) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "در حال آماده‌سازی", color: "yellow", icon: Clock },
      ready: { label: "آماده تحویل", color: "blue", icon: Package },
      delivered: {
        label: "تحویل داده شده",
        color: "emerald",
        icon: CheckCircle,
      },
      cancelled: { label: "لغو شده", color: "red", icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🍴</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">
                  پنل مدیریت رستوران
                </h1>
                <p className="text-slate-400 text-xs">امیرالمومنین</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl transition-all"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">بروزرسانی</span>
              </button>
              <button
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/30"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">اسکن سفارش</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            {[
              { id: "dashboard", label: "داشبورد", icon: BarChart3 },
              { id: "orders", label: "سفارشات", icon: Package },
              { id: "menu", label: "مدیریت منو", icon: Edit2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-bold text-blue-400">
                    {stats.totalOrders}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">کل سفارشات امروز</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-bold text-yellow-400">
                    {stats.pendingOrders}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">در حال آماده‌سازی</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  <span className="text-3xl font-bold text-emerald-400">
                    {stats.deliveredOrders}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">تحویل داده شده</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-purple-400">
                    {(stats.totalRevenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <p className="text-slate-300 text-sm">درآمد امروز</p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-4">
                آخرین سفارشات
              </h2>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-${statusConfig.color}-500/10 rounded-lg flex items-center justify-center border border-${statusConfig.color}-500/20`}
                        >
                          <StatusIcon
                            className={`w-5 h-5 text-${statusConfig.color}-400`}
                          />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{order.id}</p>
                          <p className="text-slate-400 text-sm">
                            {order.studentName}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium text-${statusConfig.color}-400`}
                        >
                          {statusConfig.label}
                        </p>
                        <p className="text-slate-400 text-xs">{order.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجو بر اساس کد سفارش یا نام..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "pending", "ready", "delivered"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        filterStatus === status
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                      }`}
                    >
                      {status === "all" ? "همه" : getStatusConfig(status).label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={order.id}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all flex flex-col"
                  >
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-lg px-3 py-1 rounded-lg shadow-lg flex-shrink-0">
                              #{order.kitchenNumber}
                            </div>
                            <h3 className="text-slate-400 font-mono text-xs truncate">
                              {order.id}
                            </h3>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-500/10 text-${statusConfig.color}-400 border border-${statusConfig.color}-500/20 flex items-center gap-1 flex-shrink-0`}
                          >
                            <StatusIcon className="w-3 h-3" />
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs truncate">
                          {order.studentName} • {order.studentId}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-white font-semibold text-sm">
                            {order.mealType}
                          </p>
                          <p className="text-slate-400 text-xs">{order.time}</p>
                        </div>
                      </div>

                      <div className="bg-slate-700/30 rounded-xl p-3 mb-3 flex-1">
                        <div className="space-y-1.5 mb-2 max-h-24 overflow-y-auto">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start text-xs"
                            >
                              <span className="text-slate-300 flex-1 leading-tight">
                                {item.name} × {item.qty}
                              </span>
                              <span className="text-slate-400 text-xs flex-shrink-0 ml-2">
                                {item.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-slate-600/50 pt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">جمع کل:</span>
                            <span className="text-white font-semibold">
                              {order.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">ارزش ژتون:</span>
                            <span className="text-yellow-400 font-semibold">
                              -{order.jettonWorth.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white font-semibold">
                              پرداختی:
                            </span>
                            <span className="text-emerald-400 font-bold">
                              {order.paid.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.status === "pending" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "ready")}
                          className="w-full px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20 font-medium text-sm"
                        >
                          آماده تحویل
                        </button>
                      )}

                      {order.status === "ready" && (
                        <button
                          onClick={() => handleDeliverOrder(order.id)}
                          className="w-full px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/30 font-medium text-sm"
                        >
                          تحویل سفارش
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">مدیریت منو</h2>
              <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/30">
                <Plus className="w-5 h-5" />
                افزودن غذا
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-xl flex items-center justify-center text-4xl">
                      {item.image}
                    </div>
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        item.available
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {item.available ? "موجود" : "ناموجود"}
                    </button>
                  </div>

                  <h3 className="text-white font-bold mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-sm mb-2">{item.category}</p>
                  <p className="text-emerald-400 font-bold mb-4">
                    {item.price.toLocaleString()} تومان
                  </p>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                      ویرایش
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setScannerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                اسکن یا وارد کردن کد سفارش
              </h2>
              <button
                onClick={() => setScannerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {!selectedOrder ? (
              <>
                <div className="bg-slate-900/50 rounded-2xl p-8 mb-6 text-center border-2 border-dashed border-slate-700/50">
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">اسکن QR Code سفارش</p>
                  <p className="text-slate-500 text-sm">
                    یا کد سفارش را وارد کنید
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="کد سفارش (مثال: ORD-2024-001240)"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none"
                  />
                  <button
                    onClick={handleScan}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                  >
                    جستجو
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 font-semibold">
                    سفارش یافت شد
                  </p>
                </div>

                <div className="bg-slate-700/30 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                    <span className="text-slate-400">شماره آشپزخانه:</span>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xl px-4 py-1 rounded-lg shadow-lg">
                      #{selectedOrder.kitchenNumber}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">کد سفارش:</span>
                    <span className="text-white font-semibold font-mono text-sm">
                      {selectedOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">دانشجو:</span>
                    <span className="text-white font-semibold">
                      {selectedOrder.studentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">وعده:</span>
                    <span className="text-white font-semibold">
                      {selectedOrder.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600/50 pt-2 mt-2">
                    <span className="text-slate-400">جمع کل:</span>
                    <span className="text-white font-semibold">
                      {selectedOrder.total.toLocaleString()} تومان
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">مبلغ پرداختی:</span>
                    <span className="text-emerald-400 font-semibold">
                      {selectedOrder.paid.toLocaleString()} تومان
                    </span>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">
                    اقلام سفارش:
                  </h4>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2">
                      <span className="text-slate-300">
                        {item.name} × {item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => handleDeliverOrder(selectedOrder.id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                  >
                    تحویل سفارش
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

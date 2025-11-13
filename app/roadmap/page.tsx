"use client";
import React, { useEffect, useState } from "react";
import {
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  Code,
  Database,
  Shield,
  Smartphone,
  Server,
  Users,
  CheckCircle,
} from "lucide-react";

const UniFoodRoadmap = () => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [taskStatuses, setTaskStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTaskStatuses = async () => {
      try {
        const response = await fetch("/api/roadmap/tasks", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch roadmap task statuses");
        }

        const data = await response.json();
        setTaskStatuses(data?.statuses ?? {});
      } catch (error) {
        console.error("Unable to load roadmap task statuses:", error);
      }
    };

    void fetchTaskStatuses();
  }, []);

  const togglePhase = (phaseId: number) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const toggleTaskStatus = (
    phaseId: number,
    taskIdx: number,
    itemIdx: number
  ) => {
    const key = `${phaseId}-${taskIdx}-${itemIdx}`;
    let previousStatus = true;
    let nextStatus = true;

    setTaskStatuses((prev) => {
      const current = prev[key] ?? true;
      previousStatus = current;
      nextStatus = !current;

      return {
        ...prev,
        [key]: nextStatus,
      };
    });

    const persistStatus = async () => {
      try {
        const response = await fetch("/api/roadmap/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phaseId, taskIdx, itemIdx }),
        });

        if (!response.ok) {
          throw new Error("Failed to update roadmap task status");
        }

        const data = await response.json();
        const persistedStatus =
          typeof data?.status === "boolean" ? data.status : nextStatus;

        setTaskStatuses((prev) => ({
          ...prev,
          [key]: persistedStatus,
        }));
      } catch (error) {
        console.error("Unable to update roadmap task status:", error);
        setTaskStatuses((prev) => ({
          ...prev,
          [key]: previousStatus,
        }));
      }
    };

    void persistStatus();
  };

  const phases = [
    {
      id: 1,
      title: "فاز 1: MVP و طراحی پایه",
      duration: "4-6 هفته",
      color: "bg-blue-500",
      tasks: [
        {
          category: "تحلیل و طراحی",
          items: [
            "تحلیل نیازمندی‌های کاربران (دانشجویان و مدیران)",
            "طراحی معماری سیستم و انتخاب تکنولوژی‌ها",
            "طراحی دیاگرام‌های UML (Use Case, Class, Sequence)",
            "طراحی UI/UX و Wireframe صفحات اصلی",
            "تعریف User Stories و Acceptance Criteria",
          ],
        },
        {
          category: "توسعه Backend",
          items: [
            "راه‌اندازی پروژه با Node.js + Express یا Django/FastAPI",
            "طراحی و پیاده‌سازی دیتابیس (PostgreSQL/MySQL)",
            "پیاده‌سازی مدل‌های User, Menu, Order, FoodItem",
            "ایجاد API های پایه: ثبت‌نام، ورود، مشاهده منو",
            "پیاده‌سازی احراز هویت ساده با JWT",
          ],
        },
        {
          category: "توسعه Frontend",
          items: [
            "راه‌اندازی پروژه با React.js یا Vue.js + Tailwind CSS",
            "پیاده‌سازی صفحات: ثبت‌نام، ورود، داشبورد دانشجویی",
            "نمایش منوی روزانه و هفتگی",
            "فرم رزرو غذا با انتخاب تاریخ و وعده",
            "Responsive Design برای موبایل و تبلت",
          ],
        },
        {
          category: "تست و مستندسازی",
          items: [
            "تست واحد (Unit Test) برای APIها",
            "تست یکپارچگی (Integration Test)",
            "مستندسازی API با Swagger/Postman",
            "تهیه مستندات فنی اولیه",
          ],
        },
      ],
    },
    {
      id: 2,
      title: "فاز 2: پرداخت، احراز هویت و QR Code",
      duration: "5-7 هفته",
      color: "bg-green-500",
      tasks: [
        {
          category: "سیستم پرداخت",
          items: [
            "یکپارچه‌سازی با درگاه بانکی (زرین‌پال، پی‌پینگ، سامان)",
            "پیاده‌سازی سیستم کیف پول دانشجویی",
            "مدیریت تراکنش‌ها و رسیدهای پرداخت",
            "پیاده‌سازی Webhook برای تایید پرداخت",
            "لاگ کامل تراکنش‌ها برای حسابرسی",
          ],
        },
        {
          category: "احراز هویت پیشرفته",
          items: [
            "یکپارچه‌سازی با سیستم دانشجویی (SSO در صورت امکان)",
            "اعتبارسنجی شماره دانشجویی و کد ملی",
            "پیاده‌سازی محدودیت رزرو (یک وعده در هر بازه زمانی)",
            "Role-Based Access Control (RBAC) برای نقش‌های مختلف",
            "Two-Factor Authentication (2FA) برای مدیران",
          ],
        },
        {
          category: "سیستم تحویل و QR Code",
          items: [
            "تولید QR Code یکتا برای هر سفارش",
            "پیاده‌سازی صفحه اسکن QR برای مسئولین سلف",
            "تایید تحویل و به‌روزرسانی وضعیت سفارش",
            "سیستم بک‌آپ: کد عددی یدکی در صورت مشکل QR",
            "لاگ کامل تحویل‌ها با زمان و کاربر تحویل‌دهنده",
          ],
        },
        {
          category: "مدیریت سفارش",
          items: [
            "امکان لغو سفارش تا قبل از مهلت مشخص",
            "بازگشت وجه خودکار در صورت لغو",
            "تاریخچه سفارش‌ها و مشاهده جزئیات",
            "فیلتر و جستجو در سفارش‌ها",
            "نوتیفیکیشن ایمیل/SMS برای تایید و یادآوری",
          ],
        },
      ],
    },
    {
      id: 3,
      title: "فاز 3: پنل مدیریت و تحلیل داده",
      duration: "6-8 هفته",
      color: "bg-purple-500",
      tasks: [
        {
          category: "پنل مدیریت منو",
          items: [
            "CRUD کامل برای غذاها و دسته‌بندی‌ها",
            "تعیین قیمت، موجودی و ظرفیت روزانه",
            "برنامه‌ریزی منوی هفتگی/ماهانه",
            "آپلود تصویر غذاها و توضیحات",
            "مدیریت اطلاعات تغذیه‌ای (کالری، آلرژن‌ها)",
          ],
        },
        {
          category: "مدیریت کاربران",
          items: [
            "لیست کاربران با فیلتر و جستجو",
            "مدیریت نقش‌ها و دسترسی‌ها",
            "تایید/رد حساب‌های کاربری جدید",
            "مسدود کردن موقت یا دائم کاربران",
            "مشاهده تاریخچه فعالیت کاربران",
          ],
        },
        {
          category: "گزارش‌گیری و تحلیل",
          items: [
            "داشبورد تحلیلی با نمودارهای تعاملی",
            "گزارش روزانه/هفتگی/ماهانه رزروها",
            "تحلیل محبوب‌ترین غذاها و ساعات پیک",
            "پیش‌بینی تقاضا با الگوریتم‌های ML ساده",
            "محاسبه درصد اتلاف غذا و پیشنهاد بهینه‌سازی",
            "گزارش مالی: درآمد، تراکنش‌ها، بدهی‌ها",
            "خروجی Excel/PDF از گزارش‌ها",
          ],
        },
        {
          category: "سیستم نوتیفیکیشن",
          items: [
            "پیاده‌سازی Web Push Notifications",
            "ارسال SMS/Email برای رویدادهای مهم",
            "نوتیفیکیشن یادآوری وعده غذایی",
            "اطلاع‌رسانی تغییرات منو یا ظرفیت",
            "هشدارهای مدیریتی (موجودی کم، سفارش‌های معلق)",
          ],
        },
      ],
    },
    {
      id: 4,
      title: "فاز 4: بهینه‌سازی، امنیت و استقرار",
      duration: "4-6 هفته",
      color: "bg-red-500",
      tasks: [
        {
          category: "امنیت و Performance",
          items: [
            "Penetration Testing و رفع آسیب‌پذیری‌ها",
            "پیاده‌سازی Rate Limiting برای APIها",
            "HTTPS و SSL Certificate",
            "خشک‌سازی و هش‌کردن رمزهای عبور (bcrypt)",
            "Validation و Sanitization ورودی‌ها",
            "بهینه‌سازی Query های دیتابیس (Indexing)",
            "استفاده از Redis برای Caching",
            "CDN برای فایل‌های استاتیک",
          ],
        },
        {
          category: "یکپارچه‌سازی",
          items: [
            "اتصال به دیتابیس مرکزی دانشگاه",
            "SSO با سیستم احراز هویت دانشگاه",
            "یکپارچه‌سازی با سیستم حسابداری",
            "API برای سیستم‌های شخص ثالث (در صورت نیاز)",
            "Webhook برای رویدادهای مهم",
          ],
        },
        {
          category: "تست و Quality Assurance",
          items: [
            "تست بار (Load Testing) با ابزارهایی مثل JMeter",
            "تست امنیتی کامل (OWASP Top 10)",
            "User Acceptance Testing (UAT) با گروه نمونه",
            "تست سناریوهای واقعی در محیط شبیه‌سازی شده",
            "رفع باگ‌ها و بهینه‌سازی نهایی",
          ],
        },
        {
          category: "استقرار (Deployment)",
          items: [
            "آماده‌سازی سرور (Linux/Ubuntu با Nginx)",
            "تنظیم CI/CD Pipeline (GitHub Actions, GitLab CI)",
            "Containerization با Docker",
            "راه‌اندازی Monitoring (Prometheus, Grafana)",
            "تنظیم Logging مرکزی (ELK Stack)",
            "Backup خودکار دیتابیس",
            "مستندات استقرار و راه‌اندازی",
          ],
        },
        {
          category: "راه‌اندازی و پشتیبانی",
          items: [
            "آموزش کاربران (ویدئو، دفترچه راهنما)",
            "راه‌اندازی پایلوت با تعداد محدود کاربر",
            "جمع‌آوری بازخورد و اعمال تغییرات",
            "راه‌اندازی رسمی در سلف دانشگاه",
            "تیم پشتیبانی و نگهداری",
            "برنامه به‌روزرسانی و توسعه آینده",
          ],
        },
      ],
    },
  ];

  const techStack = {
    frontend: [
      { name: "React.js / Next.js", reason: "قدرت بالا، اکوسیستم غنی، SEO" },
      { name: "Tailwind CSS", reason: "طراحی سریع و واکنش‌گرا" },
      { name: "Redux / Zustand", reason: "مدیریت State پیچیده" },
      { name: "Axios", reason: "ارتباط با API" },
      { name: "React Query", reason: "Data Fetching بهینه" },
    ],
    backend: [
      { name: "Node.js + Express", reason: "سرعت بالا، JavaScript همه جا" },
      {
        name: "Django / FastAPI",
        reason: "امنیت بالا، ORM قدرتمند (گزینه جایگزین)",
      },
      { name: "JWT", reason: "احراز هویت امن و Stateless" },
      { name: "Socket.io", reason: "نوتیفیکیشن Real-time" },
    ],
    database: [
      { name: "PostgreSQL", reason: "Relational، قدرتمند، Open Source" },
      { name: "Redis", reason: "Caching و Session Management" },
      { name: "MongoDB", reason: "NoSQL برای لاگ‌ها (اختیاری)" },
    ],
    other: [
      { name: "Docker", reason: "Containerization و استقرار آسان" },
      { name: "Nginx", reason: "Reverse Proxy و Load Balancing" },
      { name: "Git + GitHub/GitLab", reason: "Version Control" },
      { name: "Jest / Pytest", reason: "Testing Framework" },
      { name: "Swagger", reason: "مستندسازی API" },
    ],
  };

  const timeline = [
    { week: "هفته 1-6", phase: "فاز 1: MVP", status: "in-progress" },
    { week: "هفته 7-13", phase: "فاز 2: پرداخت و QR", status: "in-progress" },
    {
      week: "هفته 14-21",
      phase: "فاز 3: مدیریت و تحلیل",
      status: "upcoming",
    },
    { week: "هفته 22-27", phase: "فاز 4: استقرار", status: "upcoming" },
  ];

  const generatePDF = () => {
    alert(
      "قابلیت تولید PDF در حال توسعه است. می‌توانید محتوای صفحه را Print کنید یا با ابزارهای خارجی PDF تولید کنید."
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                🍽️ رودمپ فنی UniFood
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                سامانه هوشمند سفارش و مدیریت غذای دانشگاهی
              </p>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              <span>دانلود PDF</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "overview"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              نمای کلی
            </button>
            <button
              onClick={() => setSelectedTab("phases")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "phases"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              فازهای اجرایی
            </button>
            <button
              onClick={() => setSelectedTab("tech")}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                selectedTab === "tech"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              تکنولوژی‌ها
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Overview Tab */}
            {selectedTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    معرفی پروژه
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    UniFood یک سامانه‌ی جامع و هوشمند برای مدیریت سفارش غذا در
                    محیط‌های دانشگاهی است که تجربه‌ای نوین، سریع و کارآمد را
                    برای دانشجویان و مدیران سلف فراهم می‌کند.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <Users size={24} />
                      مخاطبان
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>✅ دانشجویان دانشگاه</li>
                      <li>✅ مدیران و کارکنان سلف</li>
                      <li>✅ مسئولین مالی و حسابداری</li>
                      <li>✅ مدیران ارشد دانشگاه</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle size={24} />
                      مزایای کلیدی
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>🚀 حذف صف‌های طولانی</li>
                      <li>💰 کاهش 30-40% اتلاف غذا</li>
                      <li>📊 مدیریت داده‌محور</li>
                      <li>🔒 امنیت و جلوگیری از تقلب</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">
                    تایم‌لاین پروژه
                  </h3>
                  <div className="space-y-3">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-600 min-w-[100px]">
                          {item.week}
                        </span>
                        <div className="flex-1 bg-white rounded-lg p-3 flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {item.phase}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status === "completed"
                              ? "تکمیل شده"
                              : item.status === "in-progress"
                              ? "در حال اجرا"
                              : "آینده"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phases Tab */}
            {selectedTab === "phases" && (
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className={`w-full p-6 flex items-center justify-between ${phase.color} text-white hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar size={24} />
                        <div className="text-right">
                          <h3 className="text-xl font-bold">{phase.title}</h3>
                          <p className="text-sm opacity-90 mt-1">
                            مدت زمان: {phase.duration}
                          </p>
                        </div>
                      </div>
                      {expandedPhase === phase.id ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>

                    {expandedPhase === phase.id && (
                      <div className="bg-white p-6 space-y-6">
                        {phase.tasks.map((task, idx) => (
                          <div key={idx}>
                            <h4 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-200">
                              {task.category}
                            </h4>
                            <ul className="space-y-2">
                              {task.items.map((item, itemIdx) => {
                                const taskKey = `${phase.id}-${idx}-${itemIdx}`;
                                const isChecked = taskStatuses[taskKey] ?? true;
                                return (
                                  <li
                                    key={itemIdx}
                                    className="flex items-start gap-3 text-gray-700"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleTaskStatus(phase.id, idx, itemIdx)
                                      }
                                      className={`mt-1 text-lg font-semibold transition-colors ${
                                        isChecked
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                      aria-label={
                                        isChecked
                                          ? "علامت انجام شده"
                                          : "علامت انجام نشده"
                                      }
                                    >
                                      {isChecked ? "✓" : "✗"}
                                    </button>
                                    <span>{item}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tech Stack Tab */}
            {selectedTab === "tech" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Code size={24} className="text-blue-600" />
                    Frontend
                  </h3>
                  <div className="space-y-3">
                    {techStack.frontend.map((tech, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg">
                        <div className="font-semibold text-gray-800">
                          {tech.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {tech.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Server size={24} className="text-green-600" />
                    Backend
                  </h3>
                  <div className="space-y-3">
                    {techStack.backend.map((tech, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg">
                        <div className="font-semibold text-gray-800">
                          {tech.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {tech.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Database size={24} className="text-purple-600" />
                    دیتابیس و ذخیره‌سازی
                  </h3>
                  <div className="space-y-3">
                    {techStack.database.map((tech, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg">
                        <div className="font-semibold text-gray-800">
                          {tech.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {tech.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield size={24} className="text-orange-600" />
                    ابزارهای جانبی
                  </h3>
                  <div className="space-y-3">
                    {techStack.other.map((tech, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg">
                        <div className="font-semibold text-gray-800">
                          {tech.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {tech.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border-r-4 border-yellow-400 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">
                    ⚠️ نکات مهم انتخاب تکنولوژی:
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>
                      • تکنولوژی‌های انتخابی باید با تیم توسعه همخوانی داشته
                      باشند
                    </li>
                    <li>• اولویت با قابلیت نگهداری بلندمدت و مستندات کامل</li>
                    <li>• امکان مقیاس‌پذیری برای رشد تعداد کاربران</li>
                    <li>• پشتیبانی فعال و جامعه بزرگ توسعه‌دهندگان</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <p className="text-gray-600 text-sm">
            این رودمپ فنی قابل تطبیق با نیازهای خاص دانشگاه شماست و می‌تواند بر
            اساس منابع و زمان‌بندی تنظیم شود.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            تهیه شده توسط Claude • مدت زمان تخمینی کل: 19-27 هفته
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniFoodRoadmap;

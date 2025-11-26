import "./globals.css";
import React from "react";

export const metadata = {
  title: "یونی فود",
  description: "رزرو و سفارش آنلاین غذا ویژه دانشجویان و رستوران های دانشگاهی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="w-full h-16 flex items-center justify-between px-4 bg-white shadow-md dark:bg-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src="/globe.svg" alt="لوگو" className="w-8 h-8" />
            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
              یونی فود
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-700 dark:text-blue-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A9 9 0 1112 21v0a9 9 0 01-6.879-3.196zm0 0A6.978 6.978 0 0112 15c1.67 0 3.205.574 4.379 1.546M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </body>
    </html>
  );
}

// // Sidebar Item
// function SidebarItem({ label, icon, href }: { label: string; icon: string; href: string }) {
//   return (
//     <a
//       href={href}
//       className="flex items-center gap-3 px-3 py-2 rounded-md text-md hover:bg-blue-50 dark:hover:bg-blue-900 transition text-gray-700 dark:text-gray-200"
//     >
//       <span className="text-lg">{icon}</span>
//       <span>{label}</span>
//     </a>
//   );
// }

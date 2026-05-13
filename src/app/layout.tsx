import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#14b8a6",
};

export const metadata: Metadata = {
  title: "Travel Splitter - 旅行费用分摊",
  description: "轻松分摊旅行费用，自动计算谁该给谁转多少钱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Travel Splitter",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col max-w-lg mx-auto bg-zinc-50 dark:bg-black">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center h-14 px-4">
            <a href="/" className="text-lg font-bold text-teal-600 dark:text-teal-400">
              ✈ Travel Split
            </a>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 px-4 py-4">{children}</main>
      </body>
    </html>
  );
}

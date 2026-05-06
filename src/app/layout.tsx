import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "聖遺物厳選シミュレーター | 原神・スタレ・ゼンゼロ対応",
  description: "目標スコアまでの日数や樹脂をシミュレート。ビルド比較機能やSNSシェア用レポート生成も。現役プレイヤーによる厳選サポートツール。",
  keywords: ["原神", "スターレイル", "ゼンレスゾーンゼロ", "聖遺物", "シミュレーター", "厳選"],
  verification: {
    google: "xrlDDy9Trh3xKUvFZvTEWf0EgrlL6o7teWeRTkvikPs",
  },
  openGraph: {
    title: "聖遺物厳選シミュレーター | artifact-sim.com",
    description: "あなたの聖遺物厳選、いつ終わる？期待値を可視化。",
    url: "https://artifact-sim.com",
    siteName: "Artifact Simulator",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4626634142652812"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}<Analytics /></body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
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
  title: "Bookwell",
  description: "Book a time that suits you",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Lets keyboard users jump past the header straight to the content */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <DemoBanner />
        <Suspense fallback={<div className="h-[73px] border-b border-gray-200 dark:border-gray-800" />}>
          <Header />
        </Suspense>
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

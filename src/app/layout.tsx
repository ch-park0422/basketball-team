import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileSimulator from "@/components/MobileSimulator";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "농구팀 홈페이지",
  description: "우리 팀의 이야기를 담는 공간",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-[#1d1d1f]">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <MobileSimulator />
      </body>
    </html>
  );
}

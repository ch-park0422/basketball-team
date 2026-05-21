import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthSessionProvider from "@/components/SessionProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "My Web Site",
  description: "로그인, 게시판, 영상 등록 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "ECサイト - モノリス + コンテナアーキテクチャ",
  description: "Next.js 16 + PostgreSQL + Redis で構築されたモダンなECサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>
          <Header />
          <main className="flex-grow pt-16 md:pt-20">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

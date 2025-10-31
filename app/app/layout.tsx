import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { Roboto, Noto_Sans_JP } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["japanese"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

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
    <html lang="ja" className={`${roboto.variable} ${notoSansJP.variable}`}>
      <body className="antialiased flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          メインコンテンツにスキップ
        </a>
        <SessionProvider>
          <Header />
          <main id="main-content" className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

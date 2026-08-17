import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Football Media Platform | Global Football Intelligence & Live Match Center",
  description:
    "Comprehensive football journalism, breaking transfer news, real-time match stats, tactical analysis, and a curated contributor network.",
  keywords: [
    "Football",
    "Premier League",
    "Champions League",
    "Live Scores",
    "Transfers",
    "Tactical Analysis",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-pitch-950 text-slate-100 antialiased font-sans selection:bg-brand-green selection:text-slate-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

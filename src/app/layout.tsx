import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AudioPlayer } from "@/components/AudioPlayer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AI Engineer Portfolio",
    template: "%s | AI Engineer Portfolio",
  },
  description: "Personal portfolio of an AI Engineer showcasing projects, blog posts, and expertise in artificial intelligence and machine learning.",
  keywords: ["AI Engineer", "Machine Learning", "Deep Learning", "Portfolio", "Software Engineer"],
  authors: [{ name: "AI Engineer" }],
  creator: "AI Engineer",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Engineer Portfolio",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-black text-white">
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Header navigation */}
        <Header />

        {/* Main content */}
        <main id="main-content">
          {children}
        </main>

        {/* Audio player */}
        <AudioPlayer />
      </body>
    </html>
  );
}

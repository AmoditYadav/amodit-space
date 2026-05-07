import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LoadingScreen } from "@/components/LoadingScreen";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Amodit Yadav — AI & Aerospace Engineer",
    template: "%s | Amodit Yadav",
  },
  description:
    "Personal portfolio of Amodit Yadav — AI and aerospace engineering student building intelligent systems for the future.",
  keywords: [
    "Amodit Yadav",
    "AI Engineer",
    "Aerospace",
    "Machine Learning",
    "Deep Learning",
    "Portfolio",
  ],
  authors: [{ name: "Amodit Yadav" }],
  creator: "Amodit Yadav",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Amodit Yadav",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="antialiased bg-black text-white">
        {/* Cinematic loading screen */}
        <LoadingScreen minDuration={3500} />

        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Header navigation */}
        <Header />

        {/* Main content */}
        <main id="main-content">{children}</main>

        {/* Audio player */}
        <AudioPlayer />
      </body>
    </html>
  );
}

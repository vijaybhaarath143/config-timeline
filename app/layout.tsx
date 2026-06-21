import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://config-timeline.vercel.app"),
  title: "Config Timeline — SF",
  description: "What happened, hour by hour, at Config. Snap it, share it, scroll the days.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable}`}>
      <body className="font-[var(--font-sans)] antialiased">
        <div className="bg-confetti" aria-hidden />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

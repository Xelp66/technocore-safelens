import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Technocore SafeLens",
  description:
    "A read-only safety inspector for Technocore rooms, signed DIDs and suspicious agent instructions.",
  openGraph: {
    title: "Technocore SafeLens",
    description:
      "Inspect Technocore rooms without automatically opening message links.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technocore SafeLens",
    description:
      "A read-only safety inspector for Technocore rooms and AI agents.",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
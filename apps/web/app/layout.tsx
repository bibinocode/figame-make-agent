import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  description: "Figame Make Agent 本地创作工作台",
  title: "Figame Make Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${plexSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
      lang="zh-CN"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

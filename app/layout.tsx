import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "월급생존키우기",
  description: "토스 인앱용 모바일 미니게임 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

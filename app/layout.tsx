import type { Metadata } from "next";
import { DotGothic16, Zen_Maru_Gothic } from "next/font/google";
import ThemeRegistry from "./components/ThemeRegistry";
import CtaProvider from "./components/CtaProvider";
import AuthSessionProvider from "./components/AuthSessionProvider";
import "./globals.css";

const displayFont = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIキャリア診断サービス | 5問でわかる、あなたのキャリア",
  description:
    "5問の質問に答えるだけで、AIがあなたに最適なキャリアロードマップを提案します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className={bodyFont.className}>
        <ThemeRegistry>
          <AuthSessionProvider>
            <CtaProvider>{children}</CtaProvider>
          </AuthSessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

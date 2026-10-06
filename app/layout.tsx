import type { Metadata } from "next";
import ThemeRegistry from "./components/ThemeRegistry";
import CtaProvider from "./components/CtaProvider";
import "./globals.css";

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
    <html lang="ja">
      <body>
        <ThemeRegistry>
          <CtaProvider>{children}</CtaProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPulse - 股票数据分析仪表盘",
  description: "实时股票行情、K线图、自选股管理、涨跌幅预警",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

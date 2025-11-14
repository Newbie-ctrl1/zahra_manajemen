import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zahra Management - Sistem Laporan Penjualan",
  description: "Website manajemen laporan penjualan lengkap dengan fitur export PDF/Excel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "ECWC PEMS",
  description: "Internal Management System for ECWC",
  icons: {
    icon: [
      { url: "/PEMS-Web-tag-FINAL.png", media: "(prefers-color-scheme: light)" },
      { url: "/PEMS-Web-tag-FINAL.png", media: "(prefers-color-scheme: dark)" }
    ],
    shortcut: "/PEMS-Web-tag-FINAL.png",
    apple: "/PEMS-Web-tag-FINAL.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
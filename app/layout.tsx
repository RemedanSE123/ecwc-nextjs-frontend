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
    icon: "/PEMS-Web-tag.png",
    shortcut: "/PEMS-Web-tag.png",
    apple: "/PEMS-Web-tag.png",
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
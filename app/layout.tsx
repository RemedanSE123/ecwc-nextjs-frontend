// app/layout.tsx
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ScrollRestoration from "@/components/ScrollRestoration";

const inter = Inter({ subsets: ["latin"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const LANDING_SCROLL_SCRIPT = `
(function() {
  if (typeof window === 'undefined') return;
  window.history.scrollRestoration = 'manual';
  function scrollLandingToTop() {
    if (window.location.pathname !== '/') return;
    window.scrollTo(0, 0);
    window.history.replaceState(null, '', '/#overview');
  }
  scrollLandingToTop();
  window.addEventListener('load', scrollLandingToTop);
  window.addEventListener('pageshow', function(e) {
    scrollLandingToTop();
    if (e.persisted) setTimeout(scrollLandingToTop, 0);
  });
})();
`;

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
        <Script
          id="landing-scroll-top"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: LANDING_SCROLL_SCRIPT }}
        />
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
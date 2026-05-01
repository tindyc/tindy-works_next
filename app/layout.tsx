import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeControl } from "@/components/ThemeControl";
import { TopNav } from "@/components/layout/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tindyc.com'),
  title: "TINDY_WORKS — Digital Studio Portfolio",
  description: "Interactive portfolio showcasing digital environments, creative development, and project work.",
};

const themeInitScript = `
try {
  var theme = localStorage.getItem('theme');
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'dark';
  }
  document.documentElement.dataset.theme = theme;
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <body className="min-h-full">

        <ThemeProvider>
          <div className="bg-[var(--bg-base,#050505)] text-[var(--text-primary,#ffffff)] min-h-[100dvh] flex flex-col antialiased selection:bg-[var(--text-primary,#ffffff)] selection:text-[var(--bg-base,#050505)]">
            <TopNav />
            {children}
          </div>
          <ThemeControl />
        </ThemeProvider>
      </body>
    </html>
  );
}

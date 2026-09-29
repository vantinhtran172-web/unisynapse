import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";
import { AppStateProvider } from "@/context/AppStateContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalNetCanvas from "@/components/GlobalNetCanvas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "UniSynapse",
  description: "Mạng lưới dữ liệu và tri thức học thuật do sinh viên đóng góp trên Solana.",
};

const themeScript = `
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    var queryTheme = params.get('theme');
    var stored = queryTheme || localStorage.getItem('unisynapse_theme');
    if (queryTheme) {
      localStorage.setItem('unisynapse_theme', queryTheme);
    }
    var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var isDark = stored ? (stored === 'dark' || (stored === 'system' && darkQuery.matches)) : true;
    var resolved = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolved);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <ThemeProvider>
          <AppWalletProvider>
            <AppStateProvider>
              <GlobalNetCanvas />
              {children}
            </AppStateProvider>
          </AppWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


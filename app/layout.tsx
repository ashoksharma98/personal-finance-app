import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/lib/FinanceContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FinTrack - Personal Finance Tracker',
  description: 'Manage all your bank accounts and transactions in one place.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <FinanceProvider>
              {children}
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

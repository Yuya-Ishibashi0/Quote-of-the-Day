import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Quote } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quote of the Day',
  description: 'Daily inspiration through meaningful quotes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors duration-200"
                >
                  <Quote className="h-8 w-8 text-blue-600" />
                  <span>Quote of the Day</span>
                </Link>
                
                <nav className="flex items-center space-x-8">
                  <Link 
                    href="/" 
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                  >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                  <Link 
                    href="/quotes" 
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                  >
                    Archive
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-slate-600">
                <p>&copy; 2025 Quote of the Day. Inspiring minds, one quote at a time.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
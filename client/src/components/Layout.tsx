import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Link as LinkIcon, BarChart2, Home } from 'lucide-react';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'URLs', href: '/urls', icon: LinkIcon },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <LinkIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <span>URL Shortener</span>
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            URL Shortener - Built with Fastify, React, MongoDB, Redis & ZooKeeper
          </p>
        </div>
      </footer>
    </div>
  );
}
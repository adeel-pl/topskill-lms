'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from './PureLogicsNavbar';
import { colors } from '@/lib/colors';
import {
  FiLayout,
  FiBarChart2,
  FiBook,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiZap,
} from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    // Allow access if user is admin (is_staff) or instructor (has courses)
    if (!isLoading && (!isAuthenticated || (!user?.is_staff && !user?.is_instructor))) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Determine user role
  const isAdmin = user?.is_staff || user?.role === 'admin';
  const isInstructor = user?.is_instructor || user?.role === 'instructor';

  const menuItems = [
    {
      icon: FiLayout,
      label: 'Dashboard',
      href: '/admin',
      exact: true,
      roles: ['admin', 'instructor'],
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      href: '/admin/analytics',
      roles: ['admin', 'instructor'],
    },
    {
      icon: FiBook,
      label: 'Courses',
      href: '/admin/courses',
      roles: ['admin', 'instructor'],
    },
    {
      icon: FiUsers,
      label: 'Students',
      href: '/admin/students',
      roles: ['admin', 'instructor'],
    },
    {
      icon: FiDollarSign,
      label: 'Payments',
      href: '/admin/payments',
      roles: ['admin', 'instructor'],
    },
    {
      icon: FiSettings,
      label: 'Settings',
      href: '/admin/settings',
      roles: ['admin'],
    },
  ].filter(item => {
    // Filter menu items based on user role
    if (isAdmin) return true; // Admins see everything
    return item.roles.includes('instructor');
  });

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated, not staff, and not instructor
  if (!isAuthenticated || (!user?.is_staff && !user?.is_instructor)) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <PureLogicsNavbar />

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: colors.accent.primary, opacity: 0.05 }}></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{ backgroundColor: colors.secondary, opacity: 0.05 }}></div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10" style={{ paddingTop: '10rem' }}>
        {/* Sidebar */}
        <aside className={`hidden md:block w-72 min-h-[calc(100vh-10rem)] sticky z-30 ${mobileMenuOpen ? 'md:block' : ''}`} style={{ top: '10rem', backgroundColor: colors.background.card, borderRightColor: colors.border.primary, borderRightWidth: '1px', borderRightStyle: 'solid', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
          <div className="p-6 relative">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.accent.primary, boxShadow: `0 10px 25px -5px ${colors.accent.primary}50` }}>
                  <FiZap className="text-xl" style={{ color: colors.text.white }} />
                </div>
                <h2 className="text-xl font-black" style={{ color: colors.text.dark }}>Admin Panel</h2>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Manage your platform</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all duration-300 text-sm relative overflow-hidden ${
                      active ? 'shadow-lg' : ''
                    }`}
                    style={active ? {
                      backgroundColor: colors.accent.primary,
                      color: colors.text.white
                    } : {
                      color: colors.text.dark,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = colors.background.secondary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all`}
                      style={active ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      } : {
                        backgroundColor: colors.background.secondary
                      }}>
                      <Icon className="text-xl" style={{ color: active ? colors.text.white : colors.text.muted }} />
                    </div>
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            w-72 bg-white border-r
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:hidden
          `}
          style={{ borderRightColor: colors.border.primary, borderRightWidth: '1px', borderRightStyle: 'solid' }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderBottomColor: colors.border.primary, borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.accent.primary, boxShadow: `0 10px 25px -5px ${colors.accent.primary}50` }}>
                  <FiZap className="text-xl" style={{ color: colors.text.white }} />
                </div>
                <h2 className="text-xl font-black" style={{ color: colors.text.dark }}>Admin Panel</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all duration-300 text-sm relative overflow-hidden ${
                      active ? 'shadow-lg' : ''
                    }`}
                    style={active ? {
                      backgroundColor: colors.accent.primary,
                      color: colors.text.white
                    } : {
                      color: colors.text.dark,
                      backgroundColor: 'transparent'
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all`}
                      style={active ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      } : {
                        backgroundColor: colors.background.secondary
                      }}>
                      <Icon className="text-xl" style={{ color: active ? colors.text.white : colors.text.muted }} />
                    </div>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl font-semibold transition-all duration-300"
                style={{ color: colors.accent.secondary, backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)]">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden fixed top-20 left-4 z-30 p-3 rounded-xl shadow-lg"
            style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}
          >
            <FiMenu className="w-6 h-6" style={{ color: colors.text.dark }} />
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}

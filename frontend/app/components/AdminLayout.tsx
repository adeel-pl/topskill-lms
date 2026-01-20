'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
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
  FiChevronRight,
} from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated, not staff, and not instructor
  if (!isAuthenticated || (!user?.is_staff && !user?.is_instructor)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#0F172A] border-r border-[#334155]
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#334155]">
            <div className="flex items-center gap-3">
              <img
                src="https://purelogics.com/wp-content/uploads/2023/09/Final-Logo-1.svg"
                alt="PureLogics"
                className="h-8 w-auto"
                style={{ maxWidth: '150px' }}
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex hidden text-[#9CA3AF] hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#9CA3AF] hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-[#10B981]/20 text-[#10B981] border-l-4 border-[#10B981]'
                        : 'text-[#D1D5DB] hover:bg-[#1E293B] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <FiChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#334155]">
            <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-[#1E293B]">
              <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.username || 'Admin'}
                </p>
                <p className="text-[#9CA3AF] text-xs truncate">
                  {user?.email || 'admin@topskill.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-[#EF4444] hover:bg-[#1E293B] rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-[#0F172A] border-b border-[#334155] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[#9CA3AF] hover:text-white transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[#9CA3AF] hover:text-[#10B981] transition-colors text-sm"
              >
                View Site
              </Link>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/admin/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] hover:text-[#3B82F6] transition-colors text-sm"
              >
                Django Admin
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0E27] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}



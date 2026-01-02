'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from './PureLogicsNavbar';
import { 
  FiBookOpen, 
  FiAward, 
  FiArchive, 
  FiShoppingBag, 
  FiUser,
  FiPlay
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const navItems = [
    { href: '/dashboard/my-courses', icon: FiBookOpen, label: 'My learning' },
    { href: '/dashboard/certifications', icon: FiAward, label: 'Certifications' },
    { href: '/dashboard/archived', icon: FiArchive, label: 'Archived' },
    { href: '/dashboard/purchase-history', icon: FiShoppingBag, label: 'Purchase history' },
    { href: '/dashboard/account', icon: FiUser, label: 'Account settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-[#000F2C] border-r border-[#1a2a4a] min-h-[calc(100vh-64px)] sticky top-16">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6 text-white">My learning</h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm font-medium transition-all duration-200 text-sm ${
                      active
                        ? 'bg-[#1a2a4a] text-[#66CC33] font-semibold'
                        : 'text-[#E5E7EB] hover:text-white hover:bg-[#1a2a4a]'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

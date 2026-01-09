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
  FiPlay,
  FiZap
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const navItems = [
    { href: '/dashboard/my-courses', icon: FiBookOpen, label: 'My learning', color: 'from-[#66CC33] to-[#4da826]' },
    { href: '/dashboard/certifications', icon: FiAward, label: 'Certifications', color: 'from-[#66CC33] to-[#4da826]' },
    { href: '/dashboard/archived', icon: FiArchive, label: 'Archived', color: 'from-[#66CC33] to-[#4da826]' },
    { href: '/dashboard/purchase-history', icon: FiShoppingBag, label: 'Purchase history', color: 'from-[#66CC33] to-[#4da826]' },
    { href: '/dashboard/account', icon: FiUser, label: 'Account settings', color: 'from-[#66CC33] to-[#4da826]' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <PureLogicsNavbar />

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#10B981] opacity-[0.05] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-[#3B82F6] opacity-[0.05] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10 pt-16 md:pt-20">
        {/* Sidebar */}
        <aside className="hidden md:block w-72 bg-[#1E293B] border-r border-[#334155] min-h-[calc(100vh-80px)] sticky top-16 md:top-20">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/50">
                  <FiZap className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-black text-white">My Learning</h2>
              </div>
              <p className="text-sm text-[#9CA3AF]">Manage your courses</p>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all duration-300 text-sm relative overflow-hidden ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                        : 'text-[#D1D5DB] hover:text-white hover:bg-[#334155]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      active 
                        ? 'bg-white/20' 
                        : 'bg-[#0F172A] group-hover:bg-[#334155]'
                    } transition-all`}>
                      <Icon className={`text-xl ${active ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#10B981]'}`} />
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

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

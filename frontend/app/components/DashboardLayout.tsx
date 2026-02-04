'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from './PureLogicsNavbar';
import { Container } from './ui/container';
import { Heading } from './ui/heading';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { 
  FiBookOpen, 
  FiAward, 
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
    { href: '/dashboard/my-courses', icon: FiBookOpen, label: 'My learning' },
    { href: '/dashboard/certifications', icon: FiAward, label: 'Certifications' },
    { href: '/dashboard/purchase-history', icon: FiShoppingBag, label: 'Purchase history' },
    { href: '/dashboard/account', icon: FiUser, label: 'Account settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <Container size="2xl" className="flex relative z-10 pt-40">
        {/* Sidebar */}
        <aside className="hidden md:block w-72 min-h-[calc(100vh-10rem)] sticky top-40 z-30 bg-white border-r border-[#E5E7EB]">
          <div className="p-6 relative">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#366854] shadow-[0_4px_6px_-1px_rgba(4,129,129,0.1)]">
                  <FiZap className="text-xl text-white" />
                </div>
                <Heading as="h2" size="h4">My Courses</Heading>
              </div>
              <Text variant="muted" size="sm">Manage your courses</Text>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 px-5 py-4 rounded-[0.875rem] font-semibold transition-all duration-300 text-sm ${
                      active ? 'bg-[#366854] text-white shadow-md' : 'text-[#1F2937] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      active ? 'bg-white/20' : 'bg-[#F9FAFB]'
                    }`}>
                      <Icon className={`text-xl ${active ? 'text-white' : 'text-[#6B7280]'}`} />
                    </div>
                    <span>{item.label}</span>
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
      </Container>
    </div>
  );
}

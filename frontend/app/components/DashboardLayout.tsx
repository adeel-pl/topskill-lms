'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from './PureLogicsNavbar';
import { colors } from '@/lib/colors';
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
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <PureLogicsNavbar />

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: colors.accent.primary, opacity: 0.05 }}></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{ backgroundColor: colors.accent.blue, opacity: 0.05 }}></div>
      </div>

      <div className="flex max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10" style={{ paddingTop: '10rem' }}>
        {/* Sidebar */}
        <aside className="hidden md:block w-72 min-h-[calc(100vh-10rem)] sticky z-30" style={{ top: '10rem', backgroundColor: colors.background.card, borderRightColor: colors.border.primary, borderRightWidth: '1px', borderRightStyle: 'solid', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
          <div className="p-6 relative">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.accent.primary, boxShadow: `0 10px 25px -5px ${colors.accent.primary}50` }}>
                  <FiZap className="text-xl" style={{ color: colors.text.white }} />
                </div>
                <h2 className="text-xl font-black" style={{ color: colors.text.dark }}>My Learning</h2>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Manage your courses</p>
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

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { colors } from '@/lib/colors';

export default function Footer() {
  return (
    <footer className="border-t py-16 mt-50" style={{ borderColor: colors.border.primary, backgroundColor: colors.background.primary }}>
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://purelogics.com/wp-content/themes/PureLogics/images/Final-Logo.svg"
                alt="PureLogics"
                className="h-10 md:h-12 w-auto"
                style={{ maxWidth: '200px' }}
              />
            </div>
            <p className="leading-relaxed mb-4 pr-4" style={{ color: colors.text.muted }}>
              Learn without limits. Transform your career with world-class courses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/courses" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Instructors
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Connect</h3>
            <ul className="space-y-3">
              <li>
                <Link href="https://x.com/PureLogics" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://pk.linkedin.com/company/purelogics" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://www.facebook.com/PureLogics/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://www.youtube.com/@PureLogics.Official" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/purelogics.official/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:underline" style={{ color: colors.text.muted }}>
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: colors.border.primary }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: colors.text.muted }}>
              © {new Date().getFullYear()} PureLogics. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm transition-colors hover:underline" style={{ color: colors.text.muted }}>
                Terms
              </Link>
              <Link href="/privacy" className="text-sm transition-colors hover:underline" style={{ color: colors.text.muted }}>
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm transition-colors hover:underline" style={{ color: colors.text.muted }}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


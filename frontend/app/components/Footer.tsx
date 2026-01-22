'use client';

import Link from 'next/link';

// New Color Palette for Footer
const footerColors = {
  primary: '#048181',      // Deep teal - primary accent
  secondary: '#f45c2c',    // Reddish-orange - secondary accent/CTA
  accent: '#5a9c7d',       // Sage green - secondary buttons
  dark: '#366854',         // Dark forest green - text
  light: '#9fbeb2',        // Pale mint - light background
  highlight: '#ecca72',    // Pale gold - highlights
  white: '#FFFFFF',
  textDark: '#1E293B',
  textMuted: '#64748B',
};

export default function Footer() {
  return (
    <footer className="border-t py-16 mt-0" style={{ borderColor: footerColors.light, backgroundColor: footerColors.white }}>
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://topskills.pk/wp-content/uploads/2024/08/Group-27515-2048x623.png"
                alt="TopSkill"
                className="h-10 md:h-12 w-auto"
                style={{ maxWidth: '200px' }}
              />
            </div>
            <p className="leading-relaxed mb-4 pr-4" style={{ color: footerColors.textMuted }}>
              Learn without limits. Transform your career with world-class courses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: footerColors.dark }}>Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/courses" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Instructors
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: footerColors.dark }}>Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: footerColors.dark }}>Connect</h3>
            <ul className="space-y-3">
              <li>
                <Link href="https://x.com/PureLogics" target="_blank" rel="noopener noreferrer" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://pk.linkedin.com/company/purelogics" target="_blank" rel="noopener noreferrer" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="https://www.facebook.com/PureLogics/" target="_blank" rel="noopener noreferrer" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://www.youtube.com/@PureLogics.Official" target="_blank" rel="noopener noreferrer" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/purelogics.official/" target="_blank" rel="noopener noreferrer" className="transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: footerColors.light }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: footerColors.textMuted }}>
              © {new Date().getFullYear()} PureLogics. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                Terms
              </Link>
              <Link href="/privacy" className="text-sm transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm transition-colors no-underline" style={{ color: footerColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = footerColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = footerColors.textMuted}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


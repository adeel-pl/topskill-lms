'use client';

import Link from 'next/link';
import { FiFacebook, FiLinkedin, FiTwitter, FiInstagram, FiYoutube, FiMail, FiMapPin } from 'react-icons/fi';
import { colors } from '@/lib/colors';

export default function Footer() {
  return (
    <footer className="border-t py-12 md:py-16 mt-0" style={{ borderColor: colors.border.light, backgroundColor: colors.background.primary }}>
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
            <p className="leading-relaxed mb-4 pr-4" style={{ color: colors.text.muted }}>
              Top Skills is Pakistan's No. 1 IT training platform, empowering students with industry-leading courses and hands-on expertise to excel in tech careers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="transition-colors no-underline" style={{ color: colors.text.muted }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors no-underline" style={{ color: colors.text.muted }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors no-underline" style={{ color: colors.text.muted }} onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Let's Talk */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Let's Talk</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:info@topskills.pk" 
                  className="flex items-center gap-2 transition-colors no-underline" 
                  style={{ color: colors.text.muted }} 
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary} 
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}
                >
                  <FiMail className="w-4 h-4" />
                  <span>info@topskills.pk</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Office Address */}
          <div className="px-2">
            <h3 className="text-lg font-black mb-4" style={{ color: colors.text.dark }}>Office Address</h3>
            <div className="flex items-start gap-2" style={{ color: colors.text.muted }}>
              <FiMapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <p className="leading-relaxed">
                Ground Floor, 75 R1, Johar Town, Lahore, 54000, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="pt-8 border-t mb-8" style={{ borderColor: colors.border.light }}>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.facebook.com/topskills.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: colors.background.secondary,
                color: colors.text.muted,
                border: `1px solid ${colors.border.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1877F2';
                e.currentTarget.style.color = colors.text.white;
                e.currentTarget.style.borderColor = '#1877F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
                e.currentTarget.style.color = colors.text.muted;
                e.currentTarget.style.borderColor = colors.border.primary;
              }}
              aria-label="Facebook"
            >
              <FiFacebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/topskills"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: colors.background.secondary,
                color: colors.text.muted,
                border: `1px solid ${colors.border.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0077B5';
                e.currentTarget.style.color = colors.text.white;
                e.currentTarget.style.borderColor = '#0077B5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
                e.currentTarget.style.color = colors.text.muted;
                e.currentTarget.style.borderColor = colors.border.primary;
              }}
              aria-label="LinkedIn"
            >
              <FiLinkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/topskills"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: colors.background.secondary,
                color: colors.text.muted,
                border: `1px solid ${colors.border.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1DA1F2';
                e.currentTarget.style.color = colors.text.white;
                e.currentTarget.style.borderColor = '#1DA1F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
                e.currentTarget.style.color = colors.text.muted;
                e.currentTarget.style.borderColor = colors.border.primary;
              }}
              aria-label="Twitter"
            >
              <FiTwitter className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/topskills.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: colors.background.secondary,
                color: colors.text.muted,
                border: `1px solid ${colors.border.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E4405F';
                e.currentTarget.style.color = colors.text.white;
                e.currentTarget.style.borderColor = '#E4405F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
                e.currentTarget.style.color = colors.text.muted;
                e.currentTarget.style.borderColor = colors.border.primary;
              }}
              aria-label="Instagram"
            >
              <FiInstagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@topskills"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ 
                backgroundColor: colors.background.secondary,
                color: colors.text.muted,
                border: `1px solid ${colors.border.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FF0000';
                e.currentTarget.style.color = colors.text.white;
                e.currentTarget.style.borderColor = '#FF0000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.secondary;
                e.currentTarget.style.color = colors.text.muted;
                e.currentTarget.style.borderColor = colors.border.primary;
              }}
              aria-label="YouTube"
            >
              <FiYoutube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: colors.border.light }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: colors.text.muted }}>
              © {new Date().getFullYear()} TopSkills. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

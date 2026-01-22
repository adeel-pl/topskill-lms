'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { certificatesAPI } from '@/lib/api';
import { FiAward, FiBookOpen, FiDownload, FiCalendar } from 'react-icons/fi';
import { colors } from '@/lib/colors';

interface Certificate {
  id: number;
  certificate_number: string;
  issued_at: string;
  pdf_file: string | null;
  enrollment: {
    id: number;
    course: {
      id: number;
      title: string;
      slug: string;
      featured_image?: string;
    };
  };
}

export default function CertificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadCertificates();
    }
  }, [isAuthenticated, isLoading]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificatesAPI.getAll();
      
      // Handle different response formats (pagination vs direct array)
      let certificatesData = [];
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results)) {
          certificatesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          certificatesData = response.data;
        }
      }
      
      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownloadCertificate = async (certificateId: number, certificateNumber: string) => {
    try {
      setDownloadingId(certificateId);
      const response = await certificatesAPI.download(certificateId);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-8 md:pb-12" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2" style={{ color: colors.text.dark }}>
            Certifications
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text.muted }}>
            Your earned certificates and achievements {certificates.length > 0 && `(${certificates.length})`}
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="rounded-2xl p-12 md:p-16 max-w-md mx-auto" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${colors.accent.orange}20` }}>
                <FiAward className="text-4xl md:text-5xl" style={{ color: colors.accent.orange }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: colors.text.dark }}>No certificates yet</h2>
              <p className="mb-6 md:mb-8" style={{ color: colors.text.muted }}>Complete courses to earn certificates and showcase your achievements!</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: colors.button.primary, color: colors.text.white, boxShadow: `0 10px 25px -5px ${colors.accent.primary}30` }}
              >
                <FiBookOpen />
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="rounded-2xl p-6 md:p-8 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-105"
                style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}
              >
                {/* Certificate Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${colors.accent.primary}20` }}>
                  <FiAward className="text-3xl md:text-4xl" style={{ color: colors.accent.primary }} />
                </div>

                {/* Course Title */}
                <h3 className="text-xl md:text-2xl font-black mb-3 line-clamp-2" style={{ color: colors.text.dark }}>
                  {certificate.enrollment.course.title}
                </h3>

                {/* Certificate Number */}
                <div className="mb-4">
                  <p className="text-xs md:text-sm font-semibold mb-1" style={{ color: colors.text.muted }}>
                    Certificate Number
                  </p>
                  <p className="text-sm md:text-base font-mono" style={{ color: colors.text.dark }}>
                    {certificate.certificate_number}
                  </p>
                </div>

                {/* Issue Date */}
                <div className="mb-6 flex items-center gap-2">
                  <FiCalendar className="text-sm" style={{ color: colors.text.muted }} />
                  <p className="text-sm" style={{ color: colors.text.muted }}>
                    Issued {formatDate(certificate.issued_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleDownloadCertificate(certificate.id, certificate.certificate_number)}
                    disabled={downloadingId === certificate.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: colors.button.primary, 
                      color: colors.text.white,
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (downloadingId !== certificate.id) {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <FiDownload />
                    {downloadingId === certificate.id ? 'Generating...' : 'Download Certificate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

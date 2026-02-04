'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { certificatesAPI } from '@/lib/api';
import { FiAward, FiUser, FiBookOpen, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { colors } from '@/lib/colors';
import Link from 'next/link';

interface CertificateData {
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
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certificateNumber = params?.certificateNumber as string;
  
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateNumber) {
      loadCertificate();
    }
  }, [certificateNumber]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificatesAPI.verify(certificateNumber);
      setCertificate(response.data);
    } catch (err: any) {
      
      if (err.response?.status === 404) {
        setError('Certificate not found. Please verify the certificate number is correct.');
      } else {
        setError('Failed to verify certificate. Please try again.');
      }
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

  const fullName = certificate?.enrollment?.user 
    ? `${certificate.enrollment.user.first_name || ''} ${certificate.enrollment.user.last_name || ''}`.trim() || certificate.enrollment.user.username
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.dark }}>Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-2xl w-full text-center">
          <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <FiXCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#EF4444' }} />
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.text.dark }}>
              Certificate Not Found
            </h1>
            <p className="text-lg mb-6" style={{ color: colors.text.muted }}>
              {error || 'The certificate you are looking for does not exist or has been removed.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: colors.button.primary, 
                color: colors.text.white,
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
              }}
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-16 px-4" style={{ backgroundColor: colors.background.primary }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: `${colors.accent.primary}20` }}>
            <FiAward className="w-10 h-10" style={{ color: colors.accent.primary }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.text.dark }}>
            Certificate Verification
          </h1>
          <p className="text-lg" style={{ color: colors.text.muted }}>
            This certificate has been verified and is authentic
          </p>
        </div>

        {/* Certificate Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-8" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
          {/* Success Badge */}
          <div className="px-6 md:px-8 py-4 flex items-center gap-3" style={{ backgroundColor: `${colors.accent.primary}10` }}>
            <FiCheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: colors.accent.primary }} />
            <div>
              <p className="font-bold" style={{ color: colors.accent.primary }}>Verified Certificate</p>
              <p className="text-sm" style={{ color: colors.text.muted }}>This certificate is authentic and valid</p>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* Certificate Number */}
            <div className="mb-6 pb-6" style={{ borderBottomColor: colors.border.primary, borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: colors.text.muted }}>Certificate Number</p>
              <p className="text-xl font-bold font-mono" style={{ color: colors.text.dark }}>
                {certificate.certificate_number}
              </p>
            </div>

            {/* Student Name */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FiUser className="w-5 h-5" style={{ color: colors.accent.primary }} />
                <p className="text-sm font-semibold" style={{ color: colors.text.muted }}>Student Name</p>
              </div>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: colors.text.dark }}>
                {fullName}
              </p>
            </div>

            {/* Course Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FiBookOpen className="w-5 h-5" style={{ color: colors.accent.primary }} />
                <p className="text-sm font-semibold" style={{ color: colors.text.muted }}>Course Completed</p>
              </div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: colors.accent.primary }}>
                {certificate.enrollment.course.title}
              </p>
            </div>

            {/* Issue Date */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FiCalendar className="w-5 h-5" style={{ color: colors.accent.primary }} />
                <p className="text-sm font-semibold" style={{ color: colors.text.muted }}>Date Issued</p>
              </div>
              <p className="text-lg font-semibold" style={{ color: colors.text.dark }}>
                {formatDate(certificate.issued_at)}
              </p>
            </div>

            {/* Course Image (if available) */}
            {certificate.enrollment.course.featured_image && (
              <div className="mt-8 rounded-xl overflow-hidden">
                <img
                  src={certificate.enrollment.course.featured_image}
                  alt={certificate.enrollment.course.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: colors.background.card, 
              color: colors.text.dark,
              borderColor: colors.border.primary,
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            Go to Homepage
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: colors.button.primary, 
              color: colors.text.white,
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
            }}
          >
            Browse Courses
          </Link>
        </div>

        {/* Verification Info */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: colors.text.muted }}>
            This certificate was issued by <span className="font-semibold" style={{ color: colors.text.dark }}>TopSkill LMS</span>
          </p>
        </div>
      </div>
    </div>
  );
}


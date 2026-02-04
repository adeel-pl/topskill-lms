'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { certificatesAPI } from '@/lib/api';
import { FiAward, FiBookOpen, FiDownload, FiCalendar } from 'react-icons/fi';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
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
      
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
          <Text variant="muted">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 md:pb-12 bg-white">
      <Container size="2xl" className="pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <Heading as="h1" size="h1" className="mb-2">Certifications</Heading>
          <Text variant="muted" size="lg">
            Your earned certificates and achievements {certificates.length > 0 && `(${certificates.length})`}
          </Text>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <Card variant="default" className="p-12 md:p-16 max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${colors.secondary}20` }}>
                <FiAward className="text-4xl md:text-5xl" style={{ color: colors.secondary }} />
              </div>
              <Heading as="h2" size="h2" className="mb-4">No certificates yet</Heading>
              <Text variant="muted" size="base" className="mb-6 md:mb-8">Complete courses to earn certificates and showcase your achievements!</Text>
              <Button asChild variant="default" size="lg">
                <Link href="/">
                  <FiBookOpen />
                  Browse Courses
                </Link>
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {certificates.map((certificate) => (
              <Card
                key={certificate.id}
                variant="default"
                hover={true}
                className="flex flex-col h-full p-6 md:p-8"
              >
                {/* Certificate Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${colors.primary}20` }}>
                  <FiAward className="text-3xl md:text-4xl" style={{ color: colors.primary }} />
                </div>

                {/* Course Title */}
                <Heading as="h3" size="h4" className="mb-3 line-clamp-2">
                  {certificate.enrollment.course.title}
                </Heading>

                {/* Certificate Number */}
                <div className="mb-4">
                  <Text size="sm" variant="muted" className="font-semibold mb-1">
                    Certificate Number
                  </Text>
                  <Text size="base" className="font-mono">
                    {certificate.certificate_number}
                  </Text>
                </div>

                {/* Issue Date */}
                <div className="mb-6 flex items-center gap-2">
                  <FiCalendar className="text-sm" style={{ color: colors.text.muted }} />
                  <Text size="sm" variant="muted">
                    Issued {formatDate(certificate.issued_at)}
                  </Text>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                  <Button
                    onClick={() => handleDownloadCertificate(certificate.id, certificate.certificate_number)}
                    disabled={downloadingId === certificate.id}
                    variant="default"
                    className="w-full"
                  >
                    <FiDownload />
                    {downloadingId === certificate.id ? 'Generating...' : 'Download Certificate'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

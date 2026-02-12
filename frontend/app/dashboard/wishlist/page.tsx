'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiHeart, FiBookOpen, FiTrash2 } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { colors } from '@/lib/colors';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, isLoading]);

  const loadWishlist = async () => {
    try {
      const response = await wishlistAPI.getAll();
      setWishlist(response.data.results || response.data || []);
      setLoading(false);
    } catch (error) {
      
      setWishlist([]);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      await wishlistAPI.remove(id);
      showSuccess('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      showError('Failed to remove from wishlist');
    }
  };

  const formatPrice = (price: number | undefined | null): string => {
    try {
      const safePrice = price ?? 0;
      if (typeof safePrice !== 'number' || isNaN(safePrice)) {
        return '$0';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(safePrice);
    } catch (error) {
      return '$0';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
          <Heading as="h1" size="h1" className="mb-2">Wishlist</Heading>
          <Text variant="muted" size="lg">Your saved courses</Text>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <Card variant="default" className="p-12 md:p-16 max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${colors.secondary}20` }}>
                <FiHeart className="text-4xl md:text-5xl" style={{ color: colors.secondary }} />
              </div>
              <Heading as="h2" size="h2" className="mb-4">Your wishlist is empty</Heading>
              <Text variant="muted" size="sm" className="mb-6 md:mb-8">Add courses to your wishlist to save them for later!</Text>
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
            {wishlist.map((item, idx) => (
              <Card
                key={item.id}
                variant="default"
                hover={true}
                className="p-5 md:p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <Heading as="h3" size="h5" className="flex-1 pr-4 line-clamp-2">
                    {item.course?.title || 'Course'}
                  </Heading>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="transition-colors p-2 rounded-xl flex-shrink-0"
                    style={{ color: colors.status.error }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FCA5A5';
                      e.currentTarget.style.backgroundColor = `${colors.status.error}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.status.error;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
                {item.course?.description && (
                  <Text variant="muted" size="sm" className="mb-5 md:mb-6 line-clamp-2">
                    {item.course.description}
                  </Text>
                )}
                <div className="flex items-center justify-between pt-5 md:pt-6" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                  <Text size="lg" className="font-bold" style={{ color: colors.primary }}>
                    {formatPrice(item.course?.price)}
                  </Text>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/courses/${item.course?.slug || '#'}`}>View Course</Link>
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

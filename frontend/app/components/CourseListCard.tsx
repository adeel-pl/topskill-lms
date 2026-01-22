'use client';

import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/colors';

interface CourseListCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    description?: string;
    price: number;
    thumbnail?: string;
    instructor_name: string;
    enrolled_count?: number;
    average_rating?: number;
    rating_count?: number;
    modality?: string;
  };
  index?: number;
}

export default function CourseListCard({ course, index = 0 }: CourseListCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="block group"
      >
        <div 
          className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 md:p-5 lg:p-6 hover:bg-[#334155] transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1"
          style={{ borderColor: colors.border.dark }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent.primary;
            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${colors.accent.primary}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.dark;
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="flex items-start gap-4 md:gap-5 lg:gap-6">
            <div className="relative w-28 md:w-40 lg:w-48 h-20 md:h-28 lg:h-32 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.accent.primary }}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-2xl md:text-3xl lg:text-4xl font-black">{course.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white mb-1.5 md:mb-2 transition-colors">
                {course.title}
              </h3>
              <p className="text-[#9CA3AF] mb-2 md:mb-3 line-clamp-2 text-sm md:text-base">{course.description}</p>
              <p className="text-xs md:text-sm font-semibold mb-3 md:mb-4" style={{ color: colors.accent.primary }}>{course.instructor_name}</p>
              <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm flex-wrap">
                {course.average_rating && course.average_rating > 0 ? (
                  <div className="flex items-center gap-1 md:gap-1.5">
                    <Star className="w-4 h-4" style={{ color: colors.accent.secondary, fill: colors.accent.secondary }} />
                    <span className="font-bold text-white">{course.average_rating.toFixed(1)}</span>
                    {course.rating_count && (
                      <span className="text-[#9CA3AF]">({course.rating_count})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#6B7280]">No ratings yet</span>
                )}
                <div className="flex items-center gap-1 md:gap-1.5 text-[#9CA3AF]">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolled_count || 0} students</span>
                </div>
                <span className="text-lg md:text-xl lg:text-2xl font-black" style={{ color: colors.accent.primary }}>{formatPrice(course.price)}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span 
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs font-black backdrop-blur-md border text-white"
                style={{
                  backgroundColor: course.modality === 'online' ? colors.accent.primary : colors.accent.accent,
                  borderColor: course.modality === 'online' ? colors.accent.primary : colors.accent.accent
                }}
              >
                {course.modality?.toUpperCase() || 'COURSE'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


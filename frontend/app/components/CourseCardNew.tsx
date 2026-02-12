'use client';

import Link from 'next/link';
import { Star, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { colors } from '@/lib/colors';

interface CourseCardNewProps {
  course: {
    id: number;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number | string; // API may return string
    thumbnail?: string;
    featured_image?: string;
    instructor_name: string;
    enrolled_count?: number;
    average_rating?: number;
    rating_count?: number;
    total_duration_hours?: number;
    total_lectures?: number;
    modality?: string;
  };
  index?: number;
}

export default function CourseCardNew({ course, index = 0 }: CourseCardNewProps) {
  // Defensive: Ensure course object exists
  if (!course) {
    return null;
  }

  // Defensive: Ensure required fields exist
  const courseTitle = course.title || 'Untitled Course';
  const courseSlug = course.slug || `course-${course.id || 'unknown'}`;
  // Convert price to number (API may return string)
  const coursePrice = typeof course.price === 'string' 
    ? parseFloat(course.price) || 0 
    : (typeof course.price === 'number' ? course.price : 0);
  const instructorName = course.instructor_name || 'Instructor';

  const formatPrice = (price: number) => {
    try {
      // Ensure price is a number
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (typeof numPrice !== 'number' || isNaN(numPrice) || numPrice < 0) {
        return '$0';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numPrice);
    } catch (error) {
      return '$0';
    }
  };

  // Safe fallback for first character
  const getInitial = (text: string | undefined): string => {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return '?';
    }
    return text.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index || 0) * 0.05 }}
      className="w-full h-full"
    >
             <Link 
               href={`/courses/${courseSlug}`} 
               className="block group h-full focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:ring-offset-2 rounded-[1.125rem]"
               aria-label={`View course: ${courseTitle}`}
             >
               <Card 
                 variant="default" 
                 hover={true}
                 className="h-full flex flex-col overflow-hidden"
               >
          {/* Course Image - Use featured_image first, then thumbnail, then fallback */}
          <div className="relative w-full aspect-video overflow-hidden group" style={{ backgroundColor: colors.primary }}>
            {(course.featured_image || course.thumbnail) ? (
              <motion.img
                src={course.featured_image || course.thumbnail}
                alt={courseTitle}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  if (target) {
                    target.style.display = 'none';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-4xl font-extrabold">
                  {getInitial(courseTitle)}
                </span>
              </div>
            )}
            {/* Enrolled Count Badge */}
            {course.enrolled_count && course.enrolled_count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-3 right-3 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              >
                <Users className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">
                  {course.enrolled_count > 1000 ? `${(course.enrolled_count / 1000).toFixed(1)}K` : course.enrolled_count}
                </span>
              </motion.div>
            )}
            {/* Modality Badge on Image */}
            {course.modality && typeof course.modality === 'string' && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold text-white shadow-lg"
                style={{
                  backgroundColor: course.modality.toLowerCase() === 'online' ? colors.accent.green : colors.accent.cyan,
                }}
              >
                {course.modality.toUpperCase()}
              </div>
            )}
          </div>

          {/* Course Content - EXACT spacing from reference site */}
          <CardContent className="flex-1 flex flex-col !p-5 !pt-4">
            {/* Title - EXACT font size from reference: text-base sm:text-lg md:text-xl */}
            <h3 
              className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 line-clamp-2 min-h-[2.75rem] transition-colors group-hover:text-[#00d084] leading-[1.5]"
              style={{ color: colors.text.dark }}
            >
              {courseTitle}
            </h3>
            
            {/* Instructor - EXACT from reference */}
            <p className="text-sm mb-2 line-clamp-1" style={{ color: colors.text.muted }}>
              {instructorName}
            </p>
            
            {/* Description - EXACT from reference */}
            {(course.short_description || course.description) && (
              <p className="text-sm mb-3 line-clamp-2 flex-1 leading-relaxed" style={{ color: colors.text.muted }}>
                {course.short_description || course.description}
              </p>
            )}
            
            {/* Metadata Row - Enhanced with more details */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Rating - Enhanced */}
              {course.average_rating && course.average_rating > 0 ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: `${colors.status.warning}15` }}>
                  <Star className="w-4 h-4" style={{ color: colors.status.warning, fill: colors.status.warning }} />
                  <span className="text-sm font-bold" style={{ color: colors.text.dark }}>
                    {course.average_rating.toFixed(1)}
                  </span>
                  {course.rating_count && course.rating_count > 0 && (
                    <span className="text-xs font-medium" style={{ color: colors.text.muted }}>
                      ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs px-2 py-1 rounded-md" style={{ color: colors.text.muted, backgroundColor: colors.background.soft }}>No ratings yet</span>
              )}
              
              {/* Duration */}
              {course.total_duration_hours && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: colors.background.soft }}>
                  <Clock className="w-4 h-4" style={{ color: colors.text.muted }} />
                  <span className="text-xs font-medium" style={{ color: colors.text.muted }}>
                    {course.total_duration_hours}h
                  </span>
                </div>
              )}
              
              {/* Lectures Count */}
              {course.total_lectures && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: colors.background.soft }}>
                  <span className="text-xs font-medium" style={{ color: colors.text.muted }}>
                    {course.total_lectures} lectures
                  </span>
                </div>
              )}
            </div>
            
            {/* Price - Enhanced */}
            <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{ color: colors.primary }}>
                  {formatPrice(coursePrice)}
                </span>
                {coursePrice === 0 && (
                  <span className="text-xs font-medium" style={{ color: colors.accent.green }}>Free</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

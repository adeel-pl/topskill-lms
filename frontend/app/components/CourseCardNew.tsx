'use client';

import Link from 'next/link';
import { Star, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Heading } from './ui/heading';
import { Text } from './ui/text';

interface CourseCardNewProps {
  course: {
    id: number;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number;
    thumbnail?: string;
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
  const coursePrice = course.price ?? 0;
  const instructorName = course.instructor_name || 'Instructor';

  const formatPrice = (price: number) => {
    try {
      if (typeof price !== 'number' || isNaN(price)) {
        return '$0';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      console.error('Error formatting price:', error);
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
      <Link href={`/courses/${courseSlug}`} className="block group h-full">
        <Card 
          variant="default" 
          hover={true}
          className="h-full flex flex-col overflow-hidden"
        >
          {/* Course Image */}
          <div className="relative w-full aspect-video overflow-hidden bg-[#048181]">
            {course.thumbnail ? (
              <motion.img
                src={course.thumbnail}
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
          </div>

          {/* Course Content */}
          <CardContent className="flex-1 flex flex-col !p-5 !pt-4">
            {/* Title */}
            <Heading 
              as="h3" 
              size="h5" 
              className="mb-1.5 line-clamp-2 min-h-[2.75rem] group-hover:text-[#048181] transition-colors"
            >
              {courseTitle}
            </Heading>
            
            {/* Instructor */}
            <Text variant="muted" size="sm" className="mb-2 line-clamp-1">
              {instructorName}
            </Text>
            
            {/* Description */}
            {(course.short_description || course.description) && (
              <Text variant="muted" size="sm" className="mb-3 line-clamp-2 flex-1 leading-relaxed">
                {course.short_description || course.description}
              </Text>
            )}
            
            {/* Metadata Row */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Rating */}
              {course.average_rating && course.average_rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  <Text size="sm" className="font-semibold">
                    {course.average_rating.toFixed(1)}
                  </Text>
                  {course.rating_count && course.rating_count > 0 && (
                    <Text variant="muted" size="xs">
                      ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                    </Text>
                  )}
                </div>
              ) : (
                <Text variant="muted" size="xs">No ratings yet</Text>
              )}
              
              {/* Students */}
              {course.enrolled_count !== undefined && course.enrolled_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#6B7280]" />
                  <Text variant="muted" size="xs">
                    {course.enrolled_count > 1000 ? `${(course.enrolled_count / 1000).toFixed(1)}K` : course.enrolled_count} students
                  </Text>
                </div>
              )}
              
              {/* Duration */}
              {course.total_duration_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <Text variant="muted" size="xs">
                    {course.total_duration_hours}h
                  </Text>
                </div>
              )}
            </div>
            
            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] mt-auto">
              <Text size="lg" className="font-bold text-[#048181]">
                {formatPrice(coursePrice)}
              </Text>
              {course.modality && typeof course.modality === 'string' && (
                <span 
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: course.modality.toLowerCase() === 'online' ? '#048181' : '#5a9c7d',
                    color: '#FFFFFF',
                  }}
                >
                  {course.modality.toUpperCase()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}


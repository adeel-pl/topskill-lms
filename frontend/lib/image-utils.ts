/**
 * Dynamic Image Utilities
 * Generates placeholder images for courses that don't have featured_image or thumbnail
 */

/**
 * Generate a dynamic placeholder image URL based on course information
 * Uses Picsum Photos with a seed based on course ID for consistent images
 */
export function getCourseImageUrl(
  courseId: number,
  courseTitle?: string,
  category?: string
): string {
  // Use course ID as seed for consistent images per course
  const seed = courseId || Math.floor(Math.random() * 1000);
  
  // Generate image URL with appropriate dimensions for course cards
  // Aspect ratio: 16:9 (1280x720)
  return `https://picsum.photos/seed/${seed}/1280/720`;
}

/**
 * Generate a gradient-based placeholder image using CSS gradients
 * Returns a data URL for a gradient image
 */
export function generateGradientImage(
  courseId: number,
  courseTitle?: string
): string {
  // Generate consistent colors based on course ID
  const hue1 = (courseId * 137.508) % 360; // Golden angle for distribution
  const hue2 = (hue1 + 60) % 360; // Complementary color
  
  // Create gradient colors
  const color1 = `hsl(${hue1}, 70%, 50%)`;
  const color2 = `hsl(${hue2}, 70%, 50%)`;
  
  // Create a canvas-based gradient image
  // For simplicity, we'll use a CSS gradient approach
  // In a real implementation, you might want to use canvas to generate actual image data
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

/**
 * Get the best available image for a course
 * Priority: featured_image > thumbnail > dynamic placeholder
 */
export function getBestCourseImage(
  course: {
    id: number;
    featured_image?: string;
    thumbnail?: string;
    title?: string;
    categories?: Array<{ name?: string; slug?: string }>;
  }
): string | null {
  // Check for featured_image first
  if (course.featured_image && course.featured_image.trim() !== '') {
    return course.featured_image;
  }
  
  // Check for thumbnail
  if (course.thumbnail && course.thumbnail.trim() !== '') {
    return course.thumbnail;
  }
  
  // Generate dynamic placeholder based on course ID
  const categoryName = course.categories?.[0]?.name || course.categories?.[0]?.slug;
  return getCourseImageUrl(course.id, course.title, categoryName);
}

/**
 * Alternative: Use Unsplash Source API (requires API key for production)
 * For now, using Picsum which doesn't require API key
 */
export function getUnsplashImageUrl(
  courseId: number,
  keywords: string = 'education,learning,technology'
): string {
  // Unsplash Source API (no key required for basic usage)
  const seed = courseId || Math.floor(Math.random() * 1000);
  return `https://source.unsplash.com/1280x720/?${keywords}&sig=${seed}`;
}


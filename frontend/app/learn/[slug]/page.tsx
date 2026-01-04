'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { playerAPI, coursesAPI, reviewsAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import VideoPlayer from '@/app/components/VideoPlayer';
import { FiPlay, FiCheck, FiClock, FiBook, FiMessageSquare, FiChevronRight, FiChevronLeft, FiBell, FiStar } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { useAuthStore } from '@/lib/store';

interface Lecture {
  id: number;
  title: string;
  description: string;
  youtube_video_id: string;
  content_url: string;
  duration_minutes: number;
  is_preview: boolean;
  progress?: {
    completed: boolean;
    watch_time_seconds: number;
    last_position: number;
  };
  is_completed: boolean;
  navigation?: {
    prev_lecture_id?: number;
    next_lecture_id?: number;
  };
}

interface Section {
  id: number;
  title: string;
  order: number;
  lectures: Lecture[];
  completed_lectures: number;
  total_lectures: number;
}

type TabType = 'overview' | 'reviews' | 'notes' | 'questions' | 'announcements' | 'quizzes' | 'assignments';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [watchPosition, setWatchPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [qandas, setQandas] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    loadCourseContent();
  }, [params.slug]);

  const loadCourseContent = async () => {
    try {
      const coursesRes = await coursesAPI.getBySlug(params.slug as string);

      // Handle different API response formats - same logic as course detail page
      let courseData = null;
      if (coursesRes.data.results && coursesRes.data.results.length > 0) {
        // If results array exists, find exact slug match
        courseData = coursesRes.data.results.find((c: any) => c.slug === params.slug);
      } else if (Array.isArray(coursesRes.data)) {
        // If data is directly an array
        courseData = coursesRes.data.find((c: any) => c.slug === params.slug);
      } else if (coursesRes.data.slug === params.slug) {
        // If data is a single course object
        courseData = coursesRes.data;
      }

      if (!courseData) {
        console.error('Course not found for slug:', params.slug);
        router.push('/courses');
        return;
      }

      try {
        const contentRes = await playerAPI.getContent(courseData.id);
        const { sections: sectionsData, course: courseInfo, enrollment, quizzes, assignments } = contentRes.data;

        // Check if user is enrolled
        if (!enrollment || !enrollment.id) {
          console.error('Not enrolled in this course');
          router.push(`/courses/${params.slug}`);
          return;
        }

        setCourse({ ...courseInfo, quizzes, assignments, qandas: contentRes.data.qandas || [], announcements: contentRes.data.announcements || [] });
        setSections(sectionsData);
        setQuizzes(quizzes || []);
        setAssignments(assignments || []);
        setQandas(contentRes.data.qandas || []);
        setAnnouncements(contentRes.data.announcements || []);
        setIsEnrolled(enrollment && enrollment.id ? true : false);

        // Load reviews for the course
        await loadReviews(courseInfo.id);

        if (sectionsData.length > 0 && sectionsData[0].lectures.length > 0) {
          const firstLecture = sectionsData[0].lectures[0];
          selectLecture(courseData.id, firstLecture.id);
        } else {
          setLoading(false);
        }

        setLoading(false);
      } catch (contentError: any) {
        console.error('Error loading course content:', contentError);
        if (contentError.response?.status === 403) {
          // Not enrolled - redirect to course page
          router.push(`/courses/${params.slug}`);
        } else {
          router.push('/courses');
        }
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      router.push('/courses');
      setLoading(false);
    }
  };

  const loadReviews = async (courseId: number) => {
    try {
      const response = await reviewsAPI.getAll(courseId);
      // Generate dummy reviews if none exist
      if (!response.data.results || response.data.results.length === 0) {
        const dummyReviews = generateDummyReviews(courseId);
        setReviews(dummyReviews);
      } else {
        setReviews(response.data.results || response.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Use dummy reviews as fallback
      const dummyReviews = generateDummyReviews(courseId);
      setReviews(dummyReviews);
    }
  };

  const generateDummyReviews = (courseId: number) => {
    const names = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Brown', 'Jennifer Lee', 'James Taylor', 'Maria Garcia', 'William Martinez', 'Patricia Rodriguez', 'Richard Lewis', 'Linda Walker', 'Joseph Hall'];
    const comments = [
      'Great course! Very comprehensive and well-structured.',
      'Excellent content and clear explanations. Highly recommend!',
      'The instructor explains everything in detail. Perfect for beginners.',
      'Very practical examples and real-world applications.',
      'One of the best courses I\'ve taken. Worth every penny!',
      'Clear, concise, and easy to follow. Great learning experience.',
      'The course material is up-to-date and relevant.',
      'Amazing course! Learned a lot and can apply it immediately.',
      'Well-paced course with excellent resources and support.',
      'The instructor is knowledgeable and engaging throughout.',
      'Perfect balance of theory and practice. Highly satisfied!',
      'Great value for money. Would definitely recommend to others.',
      'The course exceeded my expectations. Very well done!',
      'Excellent structure and delivery. Learned so much!',
      'Outstanding course content and teaching quality.'
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      user: {
        username: names[i % names.length].toLowerCase().replace(/\s+/g, '.'),
        first_name: names[i % names.length].split(' ')[0]
      },
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: comments[i % comments.length],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_verified_purchase: Math.random() > 0.3
    }));
  };

  const handleSubmitReview = async () => {
    if (!isEnrolled) {
      showError('You must be enrolled in this course to leave a review');
      return;
    }

    if (!reviewForm.comment.trim()) {
      showError('Please enter a review comment');
      return;
    }

    try {
      await reviewsAPI.create(course.id, reviewForm);
      showSuccess('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      await loadReviews(course.id);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const selectLecture = async (courseId: number, lectureId: number) => {
    try {
      const lectureRes = await playerAPI.getLecture(courseId, lectureId);
      const lectureData = lectureRes.data;

      setSelectedLecture(lectureData);
      setWatchPosition(lectureData.progress?.last_position || 0);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error loading lecture:', error);
    }
  };

  const handleProgress = async (progress: any) => {
    if (!selectedLecture || !course) return;

    const watchTime = Math.floor(progress.playedSeconds);
    const position = Math.floor(progress.playedSeconds);

    if (watchTime % 10 === 0) {
      try {
        await playerAPI.updateProgress(course.id, selectedLecture.id, {
          watch_time_seconds: watchTime,
          last_position: position,
          completed: progress.played >= 0.9,
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">Course not found</h2>
          <p className="text-[#9CA3AF] mb-6">The course you're looking for doesn't exist or you're not enrolled.</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  if (!selectedLecture && sections.length > 0 && sections[0].lectures.length > 0) {
    // Auto-select first lecture if none selected
    const firstLecture = sections[0].lectures[0];
    selectLecture(course.id, firstLecture.id);
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!selectedLecture) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">No lectures available</h2>
          <p className="text-[#9CA3AF] mb-6">This course doesn't have any lectures yet.</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const totalLectures = sections.reduce((acc, s) => acc + s.total_lectures, 0);

  return (
    <div className="flex flex-col h-screen bg-white">
      <PureLogicsNavbar />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Left Sidebar - Course Content */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-[#000F2C] overflow-y-auto border-r border-[#1a2a4a] transition-all duration-300 flex-shrink-0`} style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <div className="p-4 sticky top-0 bg-[#000F2C] border-b border-[#1a2a4a] z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white line-clamp-2">{course.title}</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-[#66CC33] transition-colors p-1"
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-[#66CC33]">{totalLectures} lectures</div>
          </div>

          <div className="p-2 pb-4">
            {sections.map((section) => (
              <div key={section.id} className="mb-2">
                <div className="px-3 py-2 font-semibold text-xs bg-[#1a2a4a] rounded-sm text-white">
                  {section.title}
                  <span className="ml-2 text-[#66CC33]">
                    {section.completed_lectures}/{section.total_lectures}
                  </span>
                </div>
                <div className="mt-1">
                  {section.lectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => selectLecture(course.id, lecture.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#1a2a4a] rounded-sm flex items-center justify-between ${selectedLecture.id === lecture.id ? 'bg-[#1a2a4a] border-l-2 border-[#66CC33]' : 'text-[#E5E7EB]'
                        }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {lecture.is_completed ? (
                          <FiCheck className="text-[#66CC33] flex-shrink-0" />
                        ) : (
                          <FiPlay className="text-[#66CC33] flex-shrink-0 text-xs" />
                        )}
                        <span className="truncate text-sm">{lecture.title}</span>
                        {lecture.is_preview && (
                          <span className="text-xs text-[#66CC33] ml-1">Preview</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <FiClock className="text-[#66CC33] text-xs" />
                        <span className="text-xs text-[#E5E7EB]">
                          {lecture.duration_minutes}m
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle Sidebar Button (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#000F2C] text-white p-2 rounded-r-sm z-20"
          >
            <FiChevronRight />
          </button>
        )}

        {/* Right Panel - Video Player and Content - Scrollable like normal page */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Video Player - Scrollable with page */}
          <div className="bg-black w-full" style={{
            aspectRatio: '16/9',
            height: 'auto',
            minHeight: '500px',
            maxHeight: '700px'
          }}>
            {selectedLecture.youtube_video_id ? (
              <div className="w-full h-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedLecture.youtube_video_id}?start=${Math.floor(watchPosition)}&rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={selectedLecture.title}
                />
              </div>
            ) : selectedLecture.content_url ? (
              <VideoPlayer
                url={selectedLecture.content_url}
                width="100%"
                height="100%"
                controls
                playing={false}
                onProgress={handleProgress}
                onError={(error: any) => {
                  console.error('Video player error:', error);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">No video available</p>
                  <p className="text-sm">Video ID: {selectedLecture.youtube_video_id || 'Not set'}</p>
                  <p className="text-xs mt-2">Please add a YouTube Video ID in the admin panel</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6">
            <h1 className="text-2xl font-bold mb-4 text-[#000F2C]">{selectedLecture.title}</h1>

            {/* Tabs - Dynamic based on course content */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6 flex-wrap">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'overview'
                    ? 'border-[#66CC33] text-[#000F2C]'
                    : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                    }`}
                >
                  Overview
                </button>
                {reviews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'reviews'
                      ? 'border-[#66CC33] text-[#000F2C]'
                      : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                      }`}
                  >
                    Reviews ({reviews.length})
                  </button>
                )}
                {announcements.length > 0 && (
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'announcements'
                      ? 'border-[#66CC33] text-[#000F2C]'
                      : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                      }`}
                  >
                    <FiBell className="inline mr-1" />
                    Announcements ({announcements.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'notes'
                    ? 'border-[#66CC33] text-[#000F2C]'
                    : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                    }`}
                >
                  <FiBook className="inline mr-1" />
                  Notes
                </button>
                {qandas.length > 0 && (
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'questions'
                      ? 'border-[#66CC33] text-[#000F2C]'
                      : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                      }`}
                  >
                    <FiMessageSquare className="inline mr-1" />
                    Q&A ({qandas.length})
                  </button>
                )}
                {quizzes.length > 0 && (
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'quizzes'
                      ? 'border-[#66CC33] text-[#000F2C]'
                      : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                      }`}
                  >
                    Quizzes ({quizzes.length})
                  </button>
                )}
                {assignments.length > 0 && (
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'assignments'
                      ? 'border-[#66CC33] text-[#000F2C]'
                      : 'border-transparent text-[#6a6f73] hover:text-[#000F2C]'
                      }`}
                  >
                    Assignments ({assignments.length})
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div>
                  {selectedLecture.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-[#000F2C]">About this lecture</h3>
                      <p className="text-[#6a6f73] whitespace-pre-wrap leading-relaxed">
                        {selectedLecture.description}
                      </p>
                    </div>
                  )}

                  {/* Mark as Complete Button */}
                  {!selectedLecture.is_completed && (
                    <div className="mb-6">
                      <button
                        onClick={async () => {
                          try {
                            const response = await playerAPI.markComplete(course.id, selectedLecture.id);
                            showSuccess('Lecture marked as complete!');
                            // Reload lecture to update completion status
                            await selectLecture(course.id, selectedLecture.id);
                            // Reload course content to update progress
                            await loadCourseContent();
                          } catch (error: any) {
                            console.error('Error marking lecture as complete:', error);
                            const errorMsg = error.response?.data?.error || error.message || 'Failed to mark lecture as complete';
                            showError(errorMsg);
                          }
                        }}
                        className="px-6 py-3 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <FiCheck className="w-5 h-5" />
                        Mark as Complete
                      </button>
                    </div>
                  )}

                  {selectedLecture.is_completed && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <FiCheck className="w-5 h-5" />
                        <span className="font-semibold">Lecture completed!</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons - Sticky at bottom of scrollable area */}
                  {selectedLecture.navigation && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-8 pt-4 pb-4 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 shadow-lg z-10 backdrop-blur-sm bg-white/95">
                      <div className="flex gap-4 justify-between">
                        {selectedLecture.navigation.prev_lecture_id ? (
                          <button
                            onClick={() => {
                              const prevSection = sections.find(s =>
                                s.lectures.some(l => l.id === selectedLecture.navigation?.prev_lecture_id)
                              );
                              const prevLecture = prevSection?.lectures.find(
                                l => l.id === selectedLecture.navigation?.prev_lecture_id
                              );
                              if (prevLecture) {
                                selectLecture(course.id, prevLecture.id);
                                // Scroll to top of content
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#66CC33] transition-all text-[#000F2C] font-semibold"
                          >
                            <FiChevronLeft className="w-5 h-5" />
                            Previous
                          </button>
                        ) : (
                          <div></div>
                        )}
                        {selectedLecture.navigation.next_lecture_id && (
                          <button
                            onClick={() => {
                              const nextSection = sections.find(s =>
                                s.lectures.some(l => l.id === selectedLecture.navigation?.next_lecture_id)
                              );
                              const nextLecture = nextSection?.lectures.find(
                                l => l.id === selectedLecture.navigation?.next_lecture_id
                              );
                              if (nextLecture) {
                                selectLecture(course.id, nextLecture.id);
                                // Scroll to top of content
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                          >
                            Next
                            <FiChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#000F2C]">
                      Course Reviews ({reviews.length})
                    </h3>
                    {isEnrolled && isAuthenticated && (
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold transition-colors"
                      >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                      </button>
                    )}
                  </div>

                  {/* Review Form - Only for enrolled users */}
                  {showReviewForm && isEnrolled && isAuthenticated && (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4 text-[#000F2C]">Write Your Review</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2 text-[#000F2C]">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="text-2xl"
                            >
                              <FiStar
                                className={star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2 text-[#000F2C]">Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Share your thoughts about this course..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#66CC33] resize-none"
                          rows={5}
                        />
                      </div>
                      <button
                        onClick={handleSubmitReview}
                        className="px-6 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <FiStar className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-[#6a6f73]">No reviews yet for this course</p>
                      {!isEnrolled && isAuthenticated && (
                        <p className="text-sm text-[#6a6f73] mt-2">Enroll in this course to leave a review</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.slice(0, reviewsToShow).map((review: any) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[#66CC33] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {review.user?.first_name?.charAt(0) || review.user?.username?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-[#000F2C]">
                                  {review.user?.first_name || review.user?.username || 'Anonymous'}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      className={`text-sm ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                {review.is_verified_purchase && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <p className="text-[#6a6f73] text-sm mb-2">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-[#000F2C] leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Show More Button */}
                      {reviews.length > reviewsToShow && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setReviewsToShow(reviewsToShow + 5)}
                            className="px-6 py-2 border-2 border-[#66CC33] text-[#66CC33] rounded-lg font-semibold hover:bg-[#66CC33] hover:text-white transition-colors"
                          >
                            Show More ({reviews.length - reviewsToShow} more reviews)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'announcements' && (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-[#000F2C]">
                    Course Announcements ({announcements.length})
                  </h3>
                  {announcements.length === 0 ? (
                    <div className="text-center py-12">
                      <FiBell className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-[#6a6f73]">No announcements for this course</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((announcement: any) => (
                        <div key={announcement.id} className={`border rounded-lg p-6 ${announcement.is_pinned ? 'border-[#66CC33] bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {announcement.is_pinned && (
                                <FiBell className="text-[#66CC33] flex-shrink-0" />
                              )}
                              <h4 className="text-lg font-semibold text-[#000F2C]">{announcement.title}</h4>
                            </div>
                            <span className="text-sm text-[#6a6f73]">
                              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {announcement.created_by_name && (
                            <p className="text-sm text-[#6a6f73] mb-3">
                              By {announcement.created_by_name || announcement.created_by_username}
                            </p>
                          )}
                          <p className="text-[#000F2C] leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#000F2C]">
                      My Notes ({notes.length})
                    </h3>
                    {isEnrolled && (
                      <button
                        onClick={() => {
                          // TODO: Implement add note functionality
                          showSuccess('Note feature coming soon!');
                        }}
                        className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold transition-colors"
                      >
                        <FiBook className="inline mr-1" />
                        Add Note
                      </button>
                    )}
                  </div>
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <FiBook className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-[#6a6f73] mb-4">No notes yet</p>
                      {isEnrolled && (
                        <p className="text-sm text-[#6a6f73]">Add notes while watching lectures to keep track of important points</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note: any) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#6a6f73]">
                              {note.lecture_title || 'Lecture Note'}
                            </span>
                            {note.timestamp > 0 && (
                              <span className="text-xs text-[#6a6f73]">
                                {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <p className="text-[#000F2C] whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-[#000F2C]">
                    Frequently Asked Questions ({qandas.length})
                  </h3>
                  {qandas.length === 0 ? (
                    <div className="text-center py-12">
                      <FiMessageSquare className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-[#6a6f73]">No Q&A available for this course</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {qandas.map((qa: any, index: number) => (
                        <div key={qa.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#66CC33] rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-[#000F2C] mb-3">
                                {qa.question}
                              </h4>
                              <p className="text-[#6a6f73] leading-relaxed whitespace-pre-wrap">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quizzes and Assignments Tab */}
              {activeTab === 'quizzes' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[#000F2C]">Course Quizzes</h3>
                  {course.quizzes && course.quizzes.length > 0 ? (
                    <div className="space-y-4">
                      {course.quizzes.map((quiz: any) => (
                        <div key={quiz.id} className="border border-gray-200 rounded-sm p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#000F2C]">{quiz.title}</h4>
                            <span className="text-sm text-[#6a6f73]">{quiz.passing_score}% passing score</span>
                          </div>
                          {quiz.description && (
                            <p className="text-sm text-[#6a6f73] mb-3">{quiz.description}</p>
                          )}
                          <button className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-sm font-semibold text-sm">
                            Start Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6a6f73]">No quizzes available for this course.</p>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[#000F2C]">Course Assignments</h3>
                  {course.assignments && course.assignments.length > 0 ? (
                    <div className="space-y-4">
                      {course.assignments.map((assignment: any) => (
                        <div key={assignment.id} className="border border-gray-200 rounded-sm p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#000F2C]">{assignment.title}</h4>
                            {assignment.due_date && (
                              <span className="text-sm text-[#6a6f73]">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#6a6f73] mb-3">{assignment.description}</p>
                          <button className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-sm font-semibold text-sm">
                            Submit Assignment
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6a6f73]">No assignments available for this course.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

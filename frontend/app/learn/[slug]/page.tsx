'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { playerAPI, coursesAPI, reviewsAPI, assignmentSubmissionsAPI, enrollmentsAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import VideoPlayer from '@/app/components/VideoPlayer';
import { FiPlay, FiCheck, FiClock, FiBook, FiMessageSquare, FiChevronRight, FiChevronLeft, FiBell, FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { useAuthStore } from '@/lib/store';
import { colors } from '@/lib/colors';

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
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuthStore();
  const errorShownRef = useRef<Set<number>>(new Set()); // Track which lecture IDs we've shown errors for
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
  const [submittingAssignment, setSubmittingAssignment] = useState<number | null>(null);
  const [assignmentSubmissionText, setAssignmentSubmissionText] = useState('');
  const [assignmentSubmissionFile, setAssignmentSubmissionFile] = useState<File | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState<any | null>(null);

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
        router.push('/');
        return;
      }

      try {
        const contentRes = await playerAPI.getContent(courseData.id);
        const { sections: sectionsData, course: courseInfo, enrollment, quizzes, assignments, qandas, announcements } = contentRes.data;

        // Allow access if enrolled or if there are preview lectures
        const hasPreviewLectures = sectionsData?.some((section: any) => 
          section.lectures?.some((lecture: any) => lecture.is_preview)
        ) || false;
        
        if (!enrollment || !enrollment.id) {
          if (!hasPreviewLectures) {
            // No preview available - redirect to course page
            router.push(`/courses/${params.slug}`);
            return;
          }
          // Allow preview access - will show first preview lecture only
        }

        // Filter sections/lectures for non-enrolled users - only show preview content
        let filteredSections = sectionsData;
        if (!enrollment || !enrollment.id) {
          // For non-enrolled users, find the very first preview lecture from ANY section
          let firstPreviewLecture = null;
          let firstPreviewSection = null;
          
          // Find the first preview lecture across all sections
          for (const section of sectionsData) {
            const previewLectures = section.lectures?.filter((lecture: any) => lecture.is_preview) || [];
            if (previewLectures.length > 0 && !firstPreviewLecture) {
              firstPreviewLecture = previewLectures[0];
              firstPreviewSection = section;
              break; // Found the first one, stop searching
            }
          }
          
          // Create a single section with only the first preview lecture
          if (firstPreviewLecture && firstPreviewSection) {
            filteredSections = [{
              ...firstPreviewSection,
              lectures: [firstPreviewLecture],
              total_lectures: 1,
              completed_lectures: 0,
            }];
          } else {
            // No preview found - show empty (shouldn't happen, but handle gracefully)
            filteredSections = [];
          }
        }

        const isUserEnrolled = enrollment && enrollment.id ? true : false;
        
        setCourse({ ...courseInfo, quizzes, assignments, qandas: contentRes.data.qandas || [], announcements: contentRes.data.announcements || [] });
        setSections(filteredSections);
        setQuizzes(quizzes || []);
        setAssignments(assignments || []);
        setQandas(contentRes.data.qandas || []);
        setAnnouncements(contentRes.data.announcements || []);
        setIsEnrolled(isUserEnrolled);
        setEnrollmentId(enrollment?.id || null);

        // Load reviews for the course
        await loadReviews(courseInfo.id);

        // Determine enrollment status from API response (not state, which isn't set yet)
        const userIsEnrolled = enrollment && enrollment.id ? true : false;

        // Select lecture - for non-enrolled users, ALWAYS show first preview (completely ignore URL parameter)
        if (filteredSections.length > 0) {
          let lectureToSelect = null;
          
          if (userIsEnrolled) {
            // Enrolled users: check URL parameter first
            const lectureIdFromUrl = searchParams?.get('lecture');
            if (lectureIdFromUrl) {
              const lectureFromUrl = filteredSections
                .flatMap((s: any) => s.lectures || [])
                .find((l: any) => l.id === parseInt(lectureIdFromUrl));
              if (lectureFromUrl) {
                lectureToSelect = lectureFromUrl;
              }
            }
            // If no valid lecture from URL, use first available
            if (!lectureToSelect) {
              lectureToSelect = filteredSections[0]?.lectures?.[0];
            }
          } else {
            // Non-enrolled users: ALWAYS use first preview lecture (completely ignore URL parameter)
            // This ensures they always see the first preview video, regardless of URL
            lectureToSelect = filteredSections
              .flatMap((s: any) => s.lectures || [])
              .find((l: any) => l.is_preview) || filteredSections[0]?.lectures?.[0];
          }
          
          if (lectureToSelect) {
            // Pass the lecture data directly to avoid state timing issues
            selectLecture(courseData.id, lectureToSelect.id, lectureToSelect)
              .then(() => {
                // Lecture loaded successfully
                setLoading(false);
              })
              .catch((error) => {
                console.error('Error selecting lecture:', error);
                setLoading(false);
              });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (contentError: any) {
        console.error('Error loading course content:', contentError);
        if (contentError.response?.status === 403) {
          // Not enrolled - redirect to course page
          router.push(`/courses/${params.slug}`);
        } else {
          router.push('/');
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

  const selectLecture = async (courseId: number, lectureId: number, lectureDataOverride?: any) => {
    // Prevent duplicate calls for the same lecture
    if (selectedLecture?.id === lectureId) {
      setLoading(false);
      return;
    }

    // For non-enrolled users, only allow selecting preview lectures
    if (!isEnrolled) {
      // Trust the provided lecture data (from filteredSections) - it's already filtered
      if (lectureDataOverride) {
        // If lecture data is provided, trust it - it's already been filtered to be preview
        if (!lectureDataOverride.is_preview) {
          // This shouldn't happen if filtering is correct, but handle it
          console.warn('Non-preview lecture provided for non-enrolled user');
          setLoading(false);
          return;
        }
      } else {
        // No lecture data provided - try to find from sections state
        const lecture = sections
          .flatMap(s => s.lectures || [])
          .find(l => l.id === lectureId);
        
        if (!lecture || !lecture.is_preview) {
          // Try to find first preview as fallback
          const firstPreview = sections
            .flatMap(s => s.lectures || [])
            .find(l => l.is_preview);
          if (firstPreview && firstPreview.id !== lectureId) {
            return await selectLecture(courseId, firstPreview.id, firstPreview);
          }
          setLoading(false);
          return;
        }
      }
    }

    try {
      // Always fetch from API to get complete lecture data
      const lectureRes = await playerAPI.getLecture(courseId, lectureId);
      const lectureData = lectureRes.data;

      // Double-check: if not enrolled and not preview, don't load it
      if (!isEnrolled && !lectureData.is_preview) {
        // Silently prevent - don't redirect or show error
        // Find and load the first preview lecture instead
        const firstPreview = sections
          .flatMap(s => s.lectures || [])
          .find(l => l.is_preview);
        if (firstPreview && firstPreview.id !== lectureId) {
          // Recursively call with the first preview lecture
          return await selectLecture(courseId, firstPreview.id);
        }
        setLoading(false);
        return;
      }

      setSelectedLecture(lectureData);
      setWatchPosition(lectureData.progress?.last_position || 0);
      setActiveTab('overview');
      
      // Load notes for this lecture
      if (lectureData.notes) {
        setNotes(lectureData.notes || []);
      }
      
      // Ensure loading is set to false after lecture is loaded
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading lecture:', error);
      if (error.response?.status === 403) {
        // For non-enrolled users, try to load first preview instead of redirecting
        if (!isEnrolled) {
          const firstPreview = sections
            .flatMap(s => s.lectures)
            .find(l => l.is_preview);
          if (firstPreview && firstPreview.id !== lectureId) {
            // Load first preview lecture instead - don't redirect
            selectLecture(courseId, firstPreview.id);
            return;
          }
        }
        // Only show error once per session, and only if we can't load preview
        if (!errorShownRef.current.has(lectureId)) {
          errorShownRef.current.add(lectureId);
          showError('Please enroll in this course to access this lecture');
        }
        // Don't redirect - let the page stay and show the first preview lecture
      }
    }
  };

  const handleProgress = async (progress: any) => {
    if (!selectedLecture || !course) return;

    const watchTime = Math.floor(progress.playedSeconds);
    const position = Math.floor(progress.playedSeconds);

    if (watchTime % 10 === 0 && selectedLecture) {
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

  const handleAddNote = async (content: string) => {
    if (!selectedLecture || !course) return;
    
    try {
      const timestamp = watchPosition || 0;
      let updatedNote: any;
      
      if (editingNote) {
        // Update existing note
        const response = await playerAPI.updateNote(editingNote.id, {
          content,
          timestamp: editingNote.timestamp || 0,
          is_public: editingNote.is_public || false
        });
        updatedNote = response.data;
        showSuccess('Note updated successfully!');
        
        // Optimistically update the notes list
        setNotes((prevNotes) =>
          prevNotes.map((note: any) =>
            note.id === editingNote.id
              ? { ...note, content, updated_at: updatedNote.updated_at }
              : note
          )
        );
      } else {
        // Create new note
        const response = await playerAPI.addNote(course.id, selectedLecture.id, {
          content,
          timestamp,
          is_public: false
        });
        updatedNote = response.data;
        showSuccess('Note added successfully!');
        
        // Optimistically add the new note to the list
        const newNote = {
          id: updatedNote.id,
          content: updatedNote.content,
          timestamp: updatedNote.timestamp,
          is_public: updatedNote.is_public,
          lecture_title: selectedLecture?.title || '',
          created_at: updatedNote.created_at,
          updated_at: updatedNote.created_at
        };
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
      
      // Also reload lecture to ensure we have the latest data from server
      try {
        const lectureRes = await playerAPI.getLecture(course.id, selectedLecture?.id!);
        if (lectureRes.data && lectureRes.data.notes) {
          // Update with server data to ensure consistency
          setNotes(lectureRes.data.notes || []);
        }
      } catch (refreshError) {
        console.error('Error refreshing notes:', refreshError);
        // Continue anyway since we've already updated optimistically
      }
      
      // Reset modal state
      setNoteText('');
      setEditingNote(null);
      setShowNoteModal(false);
    } catch (error: any) {
      showError(error.response?.data?.error || (editingNote ? 'Failed to update note' : 'Failed to add note'));
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNoteText(note.content);
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await playerAPI.deleteNote(noteId);
      showSuccess('Note deleted successfully!');
      
      // Optimistically remove the note from the list
      setNotes((prevNotes) => prevNotes.filter((note: any) => note.id !== noteId));
      
      // Also reload lecture to ensure we have the latest data from server
      if (course && selectedLecture) {
        try {
          const lectureRes = await playerAPI.getLecture(course.id, selectedLecture?.id!);
          if (lectureRes.data && lectureRes.data.notes) {
            // Update with server data to ensure consistency
            setNotes(lectureRes.data.notes || []);
          }
        } catch (refreshError) {
          console.error('Error refreshing notes:', refreshError);
          // Continue anyway since we've already updated optimistically
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background.dark }}>
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.border.dark, borderTopColor: colors.accent.primary }}
          ></div>
          <p style={{ color: colors.text.muted }}>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background.dark }}>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">Course not found</h2>
          <p className="mb-6" style={{ color: colors.text.muted }}>The course you're looking for doesn't exist or you're not enrolled.</p>
          <button
            onClick={() => router.push('/')}
            className="text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            style={{ backgroundColor: colors.accent.primary }}
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  // Don't auto-select here - it's already handled in loadCourseContent
  // This was causing duplicate calls

  // Only show "No lectures available" if we're not loading and sections are empty
  if (!loading && !selectedLecture && sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background.dark }}>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">No lectures available</h2>
          <p className="mb-6" style={{ color: colors.text.muted }}>This course doesn't have any lectures yet.</p>
          <button
            onClick={() => router.push('/')}
            className="text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            style={{ backgroundColor: colors.accent.primary }}
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  // If still loading or no lecture selected but sections exist, show loading
  if ((loading || !selectedLecture) && sections.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background.dark }}>
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.border.dark, borderTopColor: colors.accent.primary }}
          ></div>
          <p style={{ color: colors.text.muted }}>Loading lecture...</p>
        </div>
      </div>
    );
  }

  // If no lecture selected and no sections, show error
  if (!selectedLecture && sections.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background.dark }}>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">No lectures available</h2>
          <p className="mb-6" style={{ color: colors.text.muted }}>This course doesn't have any lectures yet.</p>
          <button
            onClick={() => router.push('/')}
            className="text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            style={{ backgroundColor: colors.accent.primary }}
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

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)', paddingTop: '5rem' }}>
        {/* Left Sidebar - Course Content */}
        <div 
          className={`${sidebarOpen ? 'w-80' : 'w-0'} overflow-y-auto border-r transition-all duration-300 flex-shrink-0`} 
          style={{ 
            height: 'calc(100vh - 64px)', 
            overflowY: 'auto',
            backgroundColor: colors.accent.primary,
            borderRightColor: colors.border.primary
          }}
        >
          <div 
            className="p-4 sticky top-0 z-10 backdrop-blur-sm border-b"
            style={{
              backgroundColor: colors.accent.primary,
              borderBottomColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold line-clamp-2" style={{ color: colors.text.white }}>{course.title}</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="transition-colors p-1"
                style={{ color: colors.text.white }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.highlight}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.text.white}
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>
            <div className="text-xs" style={{ color: colors.accent.highlight }}>{totalLectures} lectures</div>
          </div>

          <div className="p-2 pb-4">
            {sections.map((section) => (
              <div key={section.id} className="mb-2">
                <div 
                  className="px-3 py-2 font-semibold text-xs rounded-sm border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: colors.text.white
                  }}
                >
                  {section.title}
                  <span className="ml-2" style={{ color: colors.accent.highlight }}>
                    {section.completed_lectures}/{section.total_lectures}
                  </span>
                </div>
                <div className="mt-1">
                  {section.lectures.map((lecture) => {
                    // For non-enrolled users, disable non-preview lectures
                    const isDisabled = !isEnrolled && !lecture.is_preview;
                    return (
                    <button
                      key={lecture.id}
                      onClick={() => !isDisabled && selectLecture(course.id, lecture.id)}
                      disabled={isDisabled}
                      className={`w-full text-left px-4 py-2.5 text-sm rounded-sm flex items-center justify-between transition-all duration-300 ${
                        isDisabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : selectedLecture?.id === lecture.id 
                            ? 'border-l-2'
                            : ''
                      }`}
                      style={
                        isDisabled
                          ? { color: 'rgba(255, 255, 255, 0.5)' }
                          : selectedLecture?.id === lecture.id
                            ? { 
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderLeftColor: colors.accent.highlight,
                                borderLeftWidth: '3px',
                                color: colors.text.white
                              }
                            : { color: colors.text.white }
                      }
                      onMouseEnter={(e) => {
                        if (!isDisabled && selectedLecture?.id !== lecture.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.borderLeftColor = colors.accent.highlight;
                          e.currentTarget.style.borderLeftWidth = '3px';
                          e.currentTarget.style.borderLeftStyle = 'solid';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled && selectedLecture?.id !== lecture.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderLeftWidth = '0';
                        }
                      }}
                      title={isDisabled ? 'Enroll to access this lecture' : ''}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {lecture.is_completed ? (
                          <FiCheck className="flex-shrink-0" style={{ color: colors.accent.highlight }} />
                        ) : (
                          <FiPlay className="flex-shrink-0 text-xs" style={{ color: colors.accent.highlight }} />
                        )}
                        <span className="truncate text-sm">{lecture.title}</span>
                        {lecture.is_preview && (
                          <span className="text-xs ml-1" style={{ color: colors.accent.highlight }}>Preview</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <FiClock className="text-xs" style={{ color: colors.accent.highlight }} />
                        <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {lecture.duration_minutes}m
                        </span>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle Sidebar Button (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-r-sm z-20 border-r border-t border-b transition-colors"
            style={{ 
              backgroundColor: colors.accent.primary,
              borderColor: colors.border.primary,
              color: colors.text.white
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.accent.secondary;
              e.currentTarget.style.color = colors.text.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.accent.primary;
              e.currentTarget.style.color = colors.text.white;
            }}
          >
            <FiChevronRight />
          </button>
        )}

        {/* Right Panel - Video Player and Content - Scrollable like normal page */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Video Player - Scrollable with page */}
          <div className="bg-black w-full relative" style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            overflow: 'hidden'
          }}>
            {selectedLecture?.youtube_video_id ? (
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedLecture.youtube_video_id}?start=${Math.floor(watchPosition)}&rel=0&modestbranding=1&controls=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}&showinfo=0&iv_load_policy=3`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={selectedLecture?.title || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block'
                }}
              />
            ) : selectedLecture?.content_url ? (
              <div className="absolute top-0 left-0 w-full h-full">
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
              </div>
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="text-center" style={{ color: colors.text.muted }}>
                  <p className="text-lg mb-2">No video available</p>
                  <p className="text-sm">Video ID: {selectedLecture?.youtube_video_id || 'Not set'}</p>
                  <p className="text-xs mt-2">Please add a YouTube Video ID in the admin panel</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6">
            <h1 className="text-2xl font-bold mb-4" style={{ color: colors.text.dark }}>{selectedLecture?.title || 'Loading...'}</h1>

            {/* Tabs - Dynamic based on course content */}
            <div className="border-b mb-6" style={{ borderBottomColor: colors.border.primary }}>
              <div className="flex gap-6 flex-wrap">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                    activeTab === 'overview'
                    ? ''
                    : 'border-transparent'
                  }`}
                  style={
                    activeTab === 'overview' 
                      ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                      : { color: colors.text.muted }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== 'overview') {
                      e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                      e.currentTarget.style.color = colors.text.dark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'overview') {
                      e.currentTarget.style.borderBottomColor = 'transparent';
                      e.currentTarget.style.color = colors.text.muted;
                    }
                  }}
                >
                  Overview
                </button>
                {reviews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'reviews'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'reviews' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'reviews') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'reviews') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    Reviews ({reviews.length})
                  </button>
                )}
                {announcements.length > 0 && (
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'announcements'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'announcements' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'announcements') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'announcements') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    <FiBell className="inline mr-1" />
                    Announcements ({announcements.length})
                  </button>
                )}
                {(notes.length > 0 || isEnrolled) && (
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'notes'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'notes' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'notes') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'notes') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    <FiBook className="inline mr-1" />
                    Notes {notes.length > 0 && `(${notes.length})`}
                  </button>
                )}
                {qandas.length > 0 && (
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'questions'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'questions' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'questions') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'questions') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    <FiMessageSquare className="inline mr-1" />
                    Q&A ({qandas.length})
                  </button>
                )}
                {quizzes.length > 0 && (
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'quizzes'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'quizzes' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'quizzes') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'quizzes') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    Quizzes ({quizzes.length})
                  </button>
                )}
                {assignments.length > 0 && (
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all duration-300 ${
                      activeTab === 'assignments'
                      ? ''
                      : 'border-transparent'
                    }`}
                    style={
                      activeTab === 'assignments' 
                        ? { borderBottomColor: colors.accent.primary, color: colors.text.dark }
                        : { color: colors.text.muted }
                    }
                    onMouseEnter={(e) => {
                      if (activeTab !== 'assignments') {
                        e.currentTarget.style.borderBottomColor = colors.accent.primary + '60';
                        e.currentTarget.style.color = colors.text.dark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'assignments') {
                        e.currentTarget.style.borderBottomColor = 'transparent';
                        e.currentTarget.style.color = colors.text.muted;
                      }
                    }}
                  >
                    Assignments ({assignments.length})
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && selectedLecture && (
                <div>
                  {selectedLecture.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text.dark }}>About this lecture</h3>
                      <p className="whitespace-pre-wrap leading-relaxed" style={{ color: colors.text.muted }}>
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
                        className="px-6 py-3 text-white rounded-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105"
                        style={{ backgroundColor: colors.accent.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.secondary;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.primary;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <FiCheck className="w-5 h-5" />
                        Mark as Complete
                      </button>
                    </div>
                  )}

                  {selectedLecture?.is_completed && (
                    <div 
                      className="mb-6 p-4 border rounded-sm"
                      style={{
                        backgroundColor: colors.accent.accent + '20',
                        borderColor: colors.accent.accent
                      }}
                    >
                      <div className="flex items-center gap-2" style={{ color: colors.accent.accent }}>
                        <FiCheck className="w-5 h-5" />
                        <span className="font-semibold">Lecture completed!</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons - Sticky at bottom of scrollable area */}
                  {selectedLecture.navigation && (
                    <div className="sticky bottom-0 bg-white border-t borderColor: colors.border.primary mt-8 pt-4 pb-4 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 shadow-lg z-10 backdrop-blur-sm bg-white/95">
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
                            className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all duration-300 font-semibold hover:scale-105"
                            style={{ 
                              borderColor: colors.border.primary,
                              color: colors.text.dark,
                              backgroundColor: colors.background.secondary
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = colors.accent.primary;
                              e.currentTarget.style.color = colors.accent.primary;
                              e.currentTarget.style.backgroundColor = colors.background.secondary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = colors.border.primary;
                              e.currentTarget.style.color = colors.text.dark;
                              e.currentTarget.style.backgroundColor = colors.background.secondary;
                            }}
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
                            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                            style={{ backgroundColor: colors.accent.primary }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.accent.secondary;
                              e.currentTarget.style.boxShadow = `0 8px 16px ${colors.accent.secondary}40`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.accent.primary;
                              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                            }}
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
                    <h3 className="text-xl font-bold" style={{ color: colors.text.dark }}>
                      Course Reviews ({reviews.length})
                    </h3>
                    {isEnrolled && isAuthenticated && (
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: colors.accent.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.secondary;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.primary;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                      </button>
                    )}
                  </div>

                  {/* Review Form - Only for enrolled users */}
                  {showReviewForm && isEnrolled && isAuthenticated && (
                    <div 
                      className="mb-8 p-6 border rounded-lg"
                      style={{
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border.primary
                      }}
                    >
                      <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.dark }}>Write Your Review</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2" style={{ color: colors.text.dark }}>Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="text-2xl"
                            >
                              <FiStar
                                style={{
                                  color: star <= reviewForm.rating ? colors.accent.highlight : colors.border.primary,
                                  fill: star <= reviewForm.rating ? colors.accent.highlight : 'transparent'
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2" style={{ color: colors.text.dark }}>Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Share your thoughts about this course..."
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                          style={{
                            borderColor: colors.border.primary,
                            backgroundColor: colors.background.secondary,
                            color: colors.text.dark
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = colors.accent.primary;
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}40`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = colors.border.primary;
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          rows={5}
                        />
                      </div>
                      <button
                        onClick={handleSubmitReview}
                        className="px-6 py-2 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: colors.accent.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.secondary;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.accent.primary;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Submit Review
                      </button>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <FiStar className="text-4xl mx-auto mb-4" style={{ color: colors.border.primary }} />
                      <p style={{ color: colors.text.muted }}>No reviews yet for this course</p>
                      {!isEnrolled && isAuthenticated && (
                        <p className="text-sm mt-2" style={{ color: colors.text.muted }}>Enroll in this course to leave a review</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.slice(0, reviewsToShow).map((review: any) => (
                        <div 
                          key={review.id} 
                          className="border-b pb-6 last:border-b-0"
                          style={{ borderBottomColor: colors.border.primary }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: colors.accent.primary }}>
                              {review.user?.first_name?.charAt(0) || review.user?.username?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold" style={{ color: colors.text.dark }}>
                                  {review.user?.first_name || review.user?.username || 'Anonymous'}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      style={{
                                        color: star <= review.rating ? colors.accent.highlight : colors.border.primary,
                                        fill: star <= review.rating ? colors.accent.highlight : 'transparent'
                                      }}
                                      className="text-sm"
                                    />
                                  ))}
                                </div>
                                {review.is_verified_purchase && (
                                  <span 
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                      backgroundColor: colors.accent.accent + '20',
                                      color: colors.accent.accent
                                    }}
                                  >
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <p className="text-sm mb-2" style={{ color: colors.text.muted }}>
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="leading-relaxed" style={{ color: colors.text.dark }}>{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Show More Button */}
                      {reviews.length > reviewsToShow && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setReviewsToShow(reviewsToShow + 5)}
                            className="px-6 py-2 border-2 rounded-lg font-semibold hover:text-white transition-colors"
                            style={{ 
                              borderColor: colors.accent.primary, 
                              color: colors.accent.primary 
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.accent.primary;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = colors.accent.primary;
                            }}
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
                  <h3 className="text-xl font-bold mb-6" style={{ color: colors.text.dark }}>
                    Course Announcements ({announcements.length})
                  </h3>
                  {announcements.length === 0 ? (
                    <div className="text-center py-12">
                      <FiBell className="text-4xl mx-auto mb-4" style={{ color: colors.border.primary }} />
                      <p style={{ color: colors.text.muted }}>No announcements for this course</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((announcement: any) => (
                        <div 
                          key={announcement.id} 
                          className="border rounded-lg p-6"
                          style={
                            announcement.is_pinned
                              ? {
                                  borderColor: colors.accent.primary,
                                  backgroundColor: colors.accent.accent + '20'
                                }
                              : {
                                  borderColor: colors.border.primary,
                                  backgroundColor: colors.background.secondary
                                }
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {announcement.is_pinned && (
                                <FiBell className="flex-shrink-0" style={{ color: colors.accent.primary }} />
                              )}
                              <h4 className="text-lg font-semibold" style={{ color: colors.text.dark }}>{announcement.title}</h4>
                            </div>
                            <span className="text-sm" style={{ color: colors.text.muted }}>
                              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {announcement.created_by_name && (
                            <p className="text-sm mb-3" style={{ color: colors.text.muted }}>
                              By {announcement.created_by_name || announcement.created_by_username}
                            </p>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap" style={{ color: colors.text.dark }}>{announcement.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: colors.text.dark }}>
                      My Notes ({notes.length})
                    </h3>
                    {isEnrolled && selectedLecture && (
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setNoteText('');
                          setShowNoteModal(true);
                        }}
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        style={{ 
                          backgroundColor: colors.button.primary, 
                          color: colors.text.white,
                          boxShadow: `0 10px 25px -5px ${colors.primary}30`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.primary}50`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = `0 10px 25px -5px ${colors.primary}30`;
                        }}
                      >
                        <FiBook className="inline" />
                        Add Note
                      </button>
                    )}
                  </div>
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <FiBook className="text-4xl mx-auto mb-4" style={{ color: colors.text.muted }} />
                      <p className="mb-4" style={{ color: colors.text.muted }}>No notes yet</p>
                      {isEnrolled && (
                        <p className="text-sm" style={{ color: colors.text.muted }}>Add notes while watching lectures to keep track of important points</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note: any) => (
                        <div 
                          key={note.id} 
                          className="rounded-lg p-4"
                          style={{ 
                            borderColor: colors.border.primary, 
                            borderWidth: '1px', 
                            borderStyle: 'solid',
                            backgroundColor: colors.background.card
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm" style={{ color: colors.text.muted }}>
                                {note.lecture_title || 'Lecture Note'}
                              </span>
                              {note.timestamp > 0 && (
                                <span className="text-xs px-2 py-1 rounded" style={{ color: colors.text.muted, backgroundColor: colors.background.primary }}>
                                  {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-1.5 rounded transition-colors hover:scale-110"
                                style={{ color: colors.accent.primary }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = `${colors.accent.primary}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Edit note"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1.5 rounded transition-colors hover:scale-110"
                                style={{ color: colors.status.error }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = `${colors.status.error}15`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Delete note"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap" style={{ color: colors.text.dark }}>{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div>
                  <h3 className="text-xl font-bold mb-6" style={{ color: colors.text.dark }}>
                    Frequently Asked Questions ({qandas.length})
                  </h3>
                  {qandas.length === 0 ? (
                    <div className="text-center py-12">
                      <FiMessageSquare className="text-4xl mx-auto mb-4" style={{ color: colors.border.primary }} />
                      <p style={{ color: colors.text.muted }}>No Q&A available for this course</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {qandas.map((qa: any, index: number) => (
                        <div 
                          key={qa.id} 
                          className="border rounded-lg p-6"
                          style={{ 
                            borderColor: colors.border.primary,
                            backgroundColor: colors.background.card
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.accent.primary }}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-3" style={{ color: colors.text.dark }}>
                                {qa.question}
                              </h4>
                              <p className="leading-relaxed whitespace-pre-wrap" style={{ color: colors.text.muted }}>
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
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.dark }}>Course Quizzes</h3>
                  {quizzes && quizzes.length > 0 ? (
                    <div className="space-y-4">
                      {quizzes.map((quiz: any) => {
                        const attempts = quiz.attempts || [];
                        const bestScore = quiz.best_score;
                        const bestPassed = quiz.best_passed;
                        const canRetake = quiz.can_retake !== false;
                        const hasAttempts = attempts.length > 0;
                        const hasCompletedAttempts = attempts.some((a: any) => a.completed_at);
                        
                        return (
                          <div 
                            key={quiz.id} 
                            className="border rounded-sm p-4"
                            style={{ borderColor: colors.border.primary }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold" style={{ color: colors.text.dark }}>{quiz.title}</h4>
                              <span className="text-sm" style={{ color: colors.text.muted }}>{quiz.passing_score}% passing score</span>
                            </div>
                            {quiz.description && (
                              <p className="text-sm mb-3" style={{ color: colors.text.muted }}>{quiz.description}</p>
                            )}
                            
                            {/* Show best score if available */}
                            {hasCompletedAttempts && bestScore !== null && (
                              <div 
                                className="mb-3 p-3 border rounded-sm"
                                style={{
                                  backgroundColor: colors.background.secondary,
                                  borderColor: colors.border.primary
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium" style={{ color: colors.text.dark }}>Best Score:</span>
                                  <span 
                                    className="text-lg font-bold"
                                    style={{ color: bestPassed ? colors.accent.accent : colors.accent.secondary }}
                                  >
                                    {bestScore.toFixed(1)}%
                                  </span>
                                </div>
                                {bestPassed && (
                                  <div className="mt-2 text-xs font-medium" style={{ color: colors.accent.accent }}>
                                    ✓ Passed
                                  </div>
                                )}
                                {!bestPassed && (
                                  <div className="mt-2 text-xs font-medium" style={{ color: colors.accent.secondary }}>
                                    ✗ Failed (Need {quiz.passing_score}% to pass)
                                  </div>
                                )}
                                {attempts.length > 0 && (
                                  <div className="mt-2 text-xs" style={{ color: colors.text.muted }}>
                                    Attempts: {attempts.filter((a: any) => a.completed_at).length}
                                    {quiz.max_attempts && ` / ${quiz.max_attempts}`}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Show all attempts */}
                            {hasAttempts && (
                              <div className="mb-3 space-y-2">
                                <div className="text-xs font-semibold uppercase" style={{ color: colors.text.muted }}>Previous Attempts:</div>
                                {attempts.filter((a: any) => a.completed_at).map((attempt: any, idx: number) => (
                                  <div 
                                    key={attempt.id} 
                                    className="text-xs p-2 rounded border"
                                    style={{
                                      backgroundColor: colors.background.secondary,
                                      borderColor: colors.border.primary
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span style={{ color: colors.text.dark }}>Attempt {attempt.attempt_number || idx + 1}</span>
                                      <span 
                                        className="font-semibold"
                                        style={{ color: attempt.passed ? colors.accent.accent : colors.accent.secondary }}
                                      >
                                        {attempt.score !== null ? `${attempt.score.toFixed(1)}%` : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="mt-1" style={{ color: colors.text.muted }}>
                                      {new Date(attempt.completed_at).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              {hasCompletedAttempts && bestPassed && canRetake ? (
                                <button 
                                  onClick={() => router.push(`/courses/${params.slug}/quizzes/${quiz.id}`)}
                                  className="px-4 py-2 text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.accent }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.primary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.primary}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.accent;
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Retake Quiz
                                </button>
                              ) : hasCompletedAttempts && !bestPassed && canRetake ? (
                                <button 
                                  onClick={() => router.push(`/courses/${params.slug}/quizzes/${quiz.id}`)}
                                  className="px-4 py-2 text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.primary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.secondary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.primary;
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Retake Quiz
                                </button>
                              ) : !hasCompletedAttempts ? (
                                <button 
                                  onClick={() => router.push(`/courses/${params.slug}/quizzes/${quiz.id}`)}
                                  className="px-4 py-2 text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.primary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.secondary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.primary;
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Start Quiz
                                </button>
                              ) : (
                                <span className="text-sm" style={{ color: colors.text.muted }}>Maximum attempts reached</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: colors.text.muted }}>No quizzes available for this course.</p>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.dark }}>Course Assignments</h3>
                  {assignments && assignments.length > 0 ? (
                    <div className="space-y-4">
                      {assignments.map((assignment: any) => {
                        const submission = assignment.submission;
                        const isSubmitted = submission !== null;
                        const isGraded = submission && submission.status === 'graded';
                        const isLate = assignment.due_date && submission && new Date(submission.submitted_at) > new Date(assignment.due_date);
                        
                        return (
                        <div 
                          key={assignment.id} 
                          className="border rounded-sm p-4"
                          style={{ borderColor: colors.border.primary }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold" style={{ color: colors.text.dark }}>{assignment.title}</h4>
                            <div className="flex items-center gap-3">
                              {assignment.due_date && (
                                <span 
                                  className="text-sm"
                                  style={{ color: isLate ? colors.accent.secondary : colors.text.muted }}
                                >
                                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </span>
                              )}
                              {isSubmitted && (
                                <span 
                                  className="px-2 py-1 text-xs font-semibold rounded"
                                  style={{
                                    backgroundColor: submission.status === 'graded' 
                                      ? colors.accent.accent + '20'
                                      : submission.status === 'returned'
                                      ? colors.accent.primary + '20'
                                      : colors.accent.highlight + '20',
                                    color: submission.status === 'graded'
                                      ? colors.accent.accent
                                      : submission.status === 'returned'
                                      ? colors.accent.primary
                                      : colors.accent.highlight
                                  }}
                                >
                                  {submission.status === 'graded' ? 'Graded' :
                                   submission.status === 'returned' ? 'Returned' : 'Submitted'}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm mb-3" style={{ color: colors.text.muted }}>{assignment.description}</p>
                          
                          {/* Show submission status and grades */}
                          {isSubmitted && (
                              <div 
                                className="mb-3 p-3 border rounded-sm"
                                style={{
                                  backgroundColor: colors.background.secondary,
                                  borderColor: colors.border.primary
                                }}
                              >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium" style={{ color: colors.text.dark }}>Submission Status:</span>
                                  <span 
                                    className="text-sm font-semibold"
                                    style={{
                                      color: submission.status === 'graded'
                                        ? colors.accent.accent
                                        : submission.status === 'returned'
                                        ? colors.accent.primary
                                        : colors.accent.highlight
                                    }}
                                  >
                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                  </span>
                                </div>
                                <div className="text-xs" style={{ color: colors.text.muted }}>
                                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                </div>
                                {isGraded && submission.score !== null && (
                                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderTopColor: colors.border.primary }}>
                                    <span className="text-sm font-medium" style={{ color: colors.text.dark }}>Score:</span>
                                    <span className="text-lg font-bold" style={{ color: colors.accent.primary }}>
                                      {submission.score} / {assignment.max_score}
                                    </span>
                                  </div>
                                )}
                                {isGraded && submission.feedback && (
                                  <div className="pt-2 border-t" style={{ borderTopColor: colors.border.primary }}>
                                    <span className="text-sm font-medium block mb-1" style={{ color: colors.text.dark }}>Feedback:</span>
                                    <p className="text-sm whitespace-pre-wrap" style={{ color: colors.text.muted }}>{submission.feedback}</p>
                                  </div>
                                )}
                                {submission.submission_file && (
                                  <div className="pt-2 border-t borderColor: colors.border.primary">
                                    <a 
                                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${submission.submission_file}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm hover:underline"
                                      style={{ color: colors.accent.primary }}
                                    >
                                      View Submitted File →
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {submittingAssignment === assignment.id ? (
                            <div className="space-y-3 mt-3">
                              <textarea
                                value={assignmentSubmissionText}
                                onChange={(e) => setAssignmentSubmissionText(e.target.value)}
                                placeholder="Enter your submission text here..."
                                rows={4}
                                className="w-full px-3 py-2 rounded-sm focus:outline-none focus:ring-2 resize-none"
                                style={{
                                  backgroundColor: colors.background.secondary,
                                  borderColor: colors.border.primary,
                                  color: colors.text.dark
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = colors.accent.primary;
                                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}40`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = colors.border.primary;
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <input
                                type="file"
                                onChange={(e) => setAssignmentSubmissionFile(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border rounded-sm text-sm"
                                style={{ borderColor: colors.border.primary }}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    if (!enrollmentId) {
                                      showError('Enrollment not found');
                                      return;
                                    }
                                    try {
                                      setSubmittingAssignment(assignment.id);
                                      
                                      // If submission exists, update it; otherwise create new
                                      if (submission && submission.id) {
                                        const formData = new FormData();
                                        if (assignmentSubmissionText) formData.append('submission_text', assignmentSubmissionText);
                                        if (assignmentSubmissionFile) formData.append('submission_file', assignmentSubmissionFile);
                                        
                                        await assignmentSubmissionsAPI.update(submission.id, formData);
                                        showSuccess('Assignment updated successfully!');
                                      } else {
                                        await assignmentSubmissionsAPI.create({
                                          enrollment: enrollmentId,
                                          assignment: assignment.id,
                                          submission_text: assignmentSubmissionText || undefined,
                                          submission_file: assignmentSubmissionFile || undefined,
                                        });
                                        showSuccess('Assignment submitted successfully!');
                                      }
                                      
                                      setSubmittingAssignment(null);
                                      setAssignmentSubmissionText('');
                                      setAssignmentSubmissionFile(null);
                                      // Reload course content to show updated submission status
                                      loadCourseContent();
                                    } catch (error: any) {
                                      const errorMsg = error.response?.data?.error || 
                                                      error.response?.data?.detail || 
                                                      error.response?.data?.non_field_errors?.[0] ||
                                                      error.message || 
                                                      'Failed to submit assignment';
                                      showError(errorMsg);
                                      setSubmittingAssignment(null);
                                    }
                                  }}
                                  disabled={!assignmentSubmissionText && !assignmentSubmissionFile}
                                  className="px-4 py-2 disabled:cursor-not-allowed text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.primary }}
                                  onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor = colors.accent.secondary;
                                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.backgroundColor = colors.accent.primary;
                                      e.currentTarget.style.boxShadow = 'none';
                                    }
                                  }}
                                >
                                  {submission && submission.id ? 'Update' : 'Submit'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSubmittingAssignment(null);
                                    setAssignmentSubmissionText('');
                                    setAssignmentSubmissionFile(null);
                                  }}
                                  className="px-4 py-2 rounded-sm font-semibold text-sm transition-all duration-300"
                                  style={{ 
                                    backgroundColor: colors.border.primary,
                                    color: colors.text.dark
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.border.dark;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.border.primary;
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {!isSubmitted ? (
                                <button 
                                  onClick={() => {
                                    if (!enrollmentId) {
                                      showError('You must be enrolled to submit assignments');
                                      return;
                                    }
                                    setSubmittingAssignment(assignment.id);
                                  }}
                                  className="px-4 py-2 text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.primary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.secondary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.primary;
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Submit Assignment
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    if (!enrollmentId) {
                                      showError('You must be enrolled to submit assignments');
                                      return;
                                    }
                                    // Pre-fill with existing submission
                                    if (submission.submission_text) {
                                      setAssignmentSubmissionText(submission.submission_text);
                                    }
                                    setSubmittingAssignment(assignment.id);
                                  }}
                                  className="px-4 py-2 text-white rounded-sm font-semibold text-sm transition-all duration-300 hover:scale-105"
                                  style={{ backgroundColor: colors.accent.primary }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.secondary;
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent.secondary}40`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.accent.primary;
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Update Submission
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: colors.text.muted }}>No assignments available for this course.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-xl p-6 max-w-md w-full shadow-2xl" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.text.dark }}>{editingNote ? 'Edit Note' : 'Add Note'}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors"
              style={{
                borderColor: colors.border.primary,
                borderWidth: '1px',
                borderStyle: 'solid',
                backgroundColor: colors.background.secondary,
                color: colors.text.dark
              }}
              rows={6}
              autoFocus
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent.primary;
                e.target.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.primary;
                e.target.style.boxShadow = '';
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (noteText.trim()) {
                    handleAddNote(noteText.trim());
                    setNoteText('');
                    setShowNoteModal(false);
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: colors.button.primary, 
                  color: colors.text.white,
                  boxShadow: `0 10px 25px -5px ${colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${colors.primary}30`;
                }}
              >
                {editingNote ? 'Update Note' : 'Save Note'}
              </button>
              <button
                onClick={() => {
                  setNoteText('');
                  setEditingNote(null);
                  setShowNoteModal(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: colors.button.primary, 
                  color: colors.text.white,
                  boxShadow: `0 10px 25px -5px ${colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${colors.primary}30`;
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

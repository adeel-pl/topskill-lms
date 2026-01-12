'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { coursesAPI } from '@/lib/api';
import { FiBook, FiUsers, FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEdit, FiPlus } from 'react-icons/fi';

export default function InstructorsDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user is instructor or staff
    if (!user?.is_staff) {
      router.push('/dashboard/my-courses');
      return;
    }

    loadInstructorData();
  }, [isAuthenticated, user]);

  const loadInstructorData = async () => {
    try {
      // Get courses where user is instructor
      const response = await coursesAPI.getAll();
      let coursesData = [];
      if (response.data?.results) {
        coursesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }

      // Filter courses where user is instructor (for now, show all if staff)
      // In production, filter by instructor field
      setCourses(coursesData);
      
      // Calculate stats
      let totalStudents = 0;
      let totalQuizzes = 0;
      let totalAssignments = 0;
      
      coursesData.forEach((course: any) => {
        totalStudents += course.enrolled_count || 0;
        totalQuizzes += course.quizzes?.length || 0;
        totalAssignments += course.assignments?.length || 0;
      });

      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        totalQuizzes,
        totalAssignments,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading instructor data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white">
        <PureLogicsNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#334155] border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#9CA3AF]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <PureLogicsNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Instructor Dashboard</h1>
          <p className="text-[#9CA3AF]">Manage your courses, quizzes, assignments, and students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
              </div>
              <FiBook className="text-4xl text-[#66CC33]" />
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
              </div>
              <FiUsers className="text-4xl text-[#66CC33]" />
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
              </div>
              <FiFileText className="text-4xl text-[#66CC33]" />
            </div>
          </div>
          
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm mb-1">Total Assignments</p>
                <p className="text-3xl font-bold text-white">{stats.totalAssignments}</p>
              </div>
              <FiFileText className="text-4xl text-[#66CC33]" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/lms/course/add/"
              className="flex items-center gap-3 p-4 bg-[#0F172A] border border-[#334155] rounded-lg hover:border-[#66CC33] transition-colors"
            >
              <FiPlus className="text-2xl text-[#66CC33]" />
              <div>
                <p className="font-semibold text-white">Create Course</p>
                <p className="text-sm text-[#9CA3AF]">Add a new course</p>
              </div>
            </Link>
            
            <Link
              href="/admin/lms/quiz/add/"
              className="flex items-center gap-3 p-4 bg-[#0F172A] border border-[#334155] rounded-lg hover:border-[#66CC33] transition-colors"
            >
              <FiFileText className="text-2xl text-[#66CC33]" />
              <div>
                <p className="font-semibold text-white">Create Quiz</p>
                <p className="text-sm text-[#9CA3AF]">Add a new quiz</p>
              </div>
            </Link>
            
            <Link
              href="/admin/lms/assignment/add/"
              className="flex items-center gap-3 p-4 bg-[#0F172A] border border-[#334155] rounded-lg hover:border-[#66CC33] transition-colors"
            >
              <FiFileText className="text-2xl text-[#66CC33]" />
              <div>
                <p className="font-semibold text-white">Create Assignment</p>
                <p className="text-sm text-[#9CA3AF]">Add a new assignment</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Courses</h2>
            <Link
              href="/admin/lms/course/add/"
              className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold text-sm flex items-center gap-2"
            >
              <FiPlus /> Add Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9CA3AF] mb-4">No courses yet</p>
              <Link
                href="/admin/lms/course/add/"
                className="inline-block px-6 py-3 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold"
              >
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="bg-[#0F172A] border border-[#334155] rounded-lg p-6 hover:border-[#66CC33] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{course.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          course.modality === 'online' ? 'bg-blue-100 text-blue-800' :
                          course.modality === 'physical' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {course.modality?.toUpperCase() || 'ONLINE'}
                        </span>
                      </div>
                      <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-2">{course.description || course.short_description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-[#9CA3AF]">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-[#66CC33]" />
                          <span>{course.enrolled_count || 0} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-[#66CC33]" />
                          <span>{course.quizzes?.length || 0} quizzes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-[#66CC33]" />
                          <span>{course.assignments?.length || 0} assignments</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/admin/lms/course/${course.id}/change/`}
                        className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg hover:border-[#66CC33] transition-colors"
                        title="Edit Course"
                      >
                        <FiEdit className="text-[#66CC33]" />
                      </Link>
                      <Link
                        href={`/learn/${course.slug}`}
                        className="px-4 py-2 bg-[#66CC33] hover:bg-[#4da826] text-white rounded-lg font-semibold text-sm"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel Link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/"
            className="inline-block px-6 py-3 bg-[#1E293B] border border-[#334155] hover:border-[#66CC33] text-white rounded-lg font-semibold transition-colors"
          >
            Open Django Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}










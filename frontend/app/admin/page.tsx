'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { colors } from '@/lib/colors';
import {
  FiBook,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
} from 'react-icons/fi';
import EnrollmentChart from '@/app/components/charts/EnrollmentChart';
import RevenueChart from '@/app/components/charts/RevenueChart';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await adminAPI.getAnalytics({ date_range: dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [dateRange]);

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    // Allow access if user is admin (is_staff) or instructor (has courses)
    if (!isAuthenticated || (!user?.is_staff && !user?.is_instructor)) {
      router.push('/login');
      return;
    }
    loadAnalytics();
  }, [isAuthenticated, user, authLoading, router, loadAnalytics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
            <p style={{ color: colors.text.muted }}>Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p style={{ color: colors.text.muted }}>No data available</p>
        </div>
      </AdminLayout>
    );
  }

  const { overview, trends, top_courses, payment_stats } = analytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeType,
    color = colors.accent.primary,
  }: {
    icon: any;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
    color?: string;
  }) => (
    <div 
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ 
        backgroundColor: colors.background.card, 
        borderColor: colors.border.primary, 
        borderWidth: '1px', 
        borderStyle: 'solid'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent.primary;
        e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.accent.primary}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border.primary;
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${changeType === 'up' ? '' : ''}`} style={{ color: changeType === 'up' ? colors.accent.primary : colors.accent.secondary }}>
            {changeType === 'up' ? <FiArrowUp /> : <FiArrowDown />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm mb-1 font-medium" style={{ color: colors.text.muted }}>{label}</p>
        <p className="text-3xl font-black" style={{ color: colors.text.dark }}>{value}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 pb-8 md:pb-12" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-10 md:pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2" style={{ color: colors.text.dark }}>
                Admin Dashboard
              </h1>
              <p className="text-sm md:text-base lg:text-lg" style={{ color: colors.text.muted }}>{overview.date_label}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base"
                style={{ 
                  backgroundColor: colors.background.card, 
                  borderColor: colors.border.primary, 
                  borderWidth: '1px', 
                  borderStyle: 'solid',
                  color: colors.text.dark
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                }}
              >
                <option value="all">All Time</option>
                <option value="1day">Last 24 Hours</option>
                <option value="1week">Last 7 Days</option>
                <option value="1month">Last 30 Days</option>
              </select>
              <button
                onClick={loadAnalytics}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 md:px-5 lg:px-6 py-2.5 md:py-3 rounded-xl font-black transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap"
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
                <FiRefreshCw className={`text-lg md:text-xl ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8 mb-8 md:mb-12">
            <StatCard
              icon={FiBook}
              label="Total Courses"
              value={overview.total_courses}
              color={colors.accent.primary}
            />
            <StatCard
              icon={FiUsers}
              label="Total Students"
              value={overview.total_students}
              color={colors.accent.blue}
            />
            <StatCard
              icon={FiTrendingUp}
              label="Total Enrollments"
              value={overview.total_enrollments}
              color={colors.accent.accent}
            />
            <StatCard
              icon={FiDollarSign}
              label="Total Revenue"
              value={formatCurrency(overview.total_revenue)}
              color={colors.accent.secondary}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-8 mb-8 md:mb-12">
            {/* Enrollment Trends */}
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: colors.background.card, 
                borderColor: colors.border.primary, 
                borderWidth: '1px', 
                borderStyle: 'solid'
              }}
            >
              <h3 className="text-xl md:text-2xl font-black mb-6" style={{ color: colors.text.dark }}>Enrollment Trends</h3>
              <EnrollmentChart data={trends.enrollments} />
            </div>

            {/* Revenue Trends */}
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: colors.background.card, 
                borderColor: colors.border.primary, 
                borderWidth: '1px', 
                borderStyle: 'solid'
              }}
            >
              <h3 className="text-xl md:text-2xl font-black mb-6" style={{ color: colors.text.dark }}>Revenue Trends</h3>
              <RevenueChart data={trends.revenue} />
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: colors.background.card, 
                borderColor: colors.border.primary, 
                borderWidth: '1px', 
                borderStyle: 'solid'
              }}
            >
              <h3 className="text-lg md:text-xl font-black mb-4" style={{ color: colors.text.dark }}>Enrollment Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.muted }}>Active</span>
                  <span className="font-black" style={{ color: colors.text.dark }}>{overview.active_enrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.muted }}>Completed</span>
                  <span className="font-black" style={{ color: colors.text.dark }}>{overview.completed_enrollments}</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: colors.background.card, 
                borderColor: colors.border.primary, 
                borderWidth: '1px', 
                borderStyle: 'solid'
              }}
            >
              <h3 className="text-lg md:text-xl font-black mb-4" style={{ color: colors.text.dark }}>Payment Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.muted }}>Paid</span>
                  <span className="font-black" style={{ color: colors.accent.primary }}>{payment_stats.paid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.muted }}>Pending</span>
                  <span className="font-black" style={{ color: colors.accent.secondary }}>{payment_stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.muted }}>Failed</span>
                  <span className="font-black" style={{ color: colors.accent.secondary }}>{payment_stats.failed}</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: colors.background.card, 
                borderColor: colors.border.primary, 
                borderWidth: '1px', 
                borderStyle: 'solid'
              }}
            >
              <h3 className="text-lg md:text-xl font-black mb-4" style={{ color: colors.text.dark }}>Top Courses</h3>
              <div className="space-y-2">
                {top_courses.slice(0, 3).map((course: any, index: number) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1" style={{ color: colors.text.muted }}>
                      {index + 1}. {course.title}
                    </span>
                    <span className="font-black ml-2" style={{ color: colors.text.dark }}>{course.enrollment_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

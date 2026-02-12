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
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';

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
        <Text size="sm" variant="muted" className="mb-1 font-medium">{label}</Text>
        <Heading as="h2" size="h1" style={{ color: colors.text.dark }}>{value}</Heading>
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
              <Heading as="h1" size="display" className="mb-2" style={{ color: colors.text.dark }}>
                Admin Dashboard
              </Heading>
              <Text size="lg" variant="muted">{overview.date_label}</Text>
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
              <Button
                onClick={loadAnalytics}
                disabled={refreshing}
                variant="default"
                size="lg"
                className="whitespace-nowrap"
              >
                <FiRefreshCw className={`text-lg md:text-xl ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
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
              color={colors.secondary}
            />
            <StatCard
              icon={FiTrendingUp}
              label="Total Enrollments"
              value={overview.total_enrollments}
              color={colors.primary}
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
            <Card variant="outlined" className="p-6">
              <h3 className="text-xl md:text-2xl font-black mb-6" style={{ color: colors.text.dark }}>Enrollment Trends</h3>
              <EnrollmentChart data={trends.enrollments} />
            </Card>

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
            <Card variant="outlined" className="p-6">
              <Heading as="h3" size="h4" className="mb-4" style={{ color: colors.text.dark }}>Enrollment Status</Heading>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text variant="muted">Active</Text>
                  <Text className="font-black" style={{ color: colors.text.dark }}>{overview.active_enrollments}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text variant="muted">Completed</Text>
                  <Text className="font-black" style={{ color: colors.text.dark }}>{overview.completed_enrollments}</Text>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className="p-6">
              <Heading as="h3" size="h4" className="mb-4" style={{ color: colors.text.dark }}>Payment Status</Heading>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Text variant="muted">Paid</Text>
                  <Text className="font-black" style={{ color: colors.accent.primary }}>{payment_stats.paid}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text variant="muted">Pending</Text>
                  <Text className="font-black" style={{ color: colors.accent.secondary }}>{payment_stats.pending}</Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text variant="muted">Failed</Text>
                  <Text className="font-black" style={{ color: colors.accent.secondary }}>{payment_stats.failed}</Text>
                </div>
              </div>
            </Card>

            <Card variant="outlined" className="p-6">
              <Heading as="h3" size="h4" className="mb-4" style={{ color: colors.text.dark }}>Top Courses</Heading>
              <div className="space-y-2">
                {top_courses.slice(0, 3).map((course: any, index: number) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <Text size="sm" variant="muted" className="truncate flex-1">
                      {index + 1}. {course.title}
                    </Text>
                    <Text className="font-black ml-2" style={{ color: colors.text.dark }}>{course.enrollment_count}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

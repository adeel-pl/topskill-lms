'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.is_staff) {
      router.push('/login');
      return;
    }
    loadPayments();
  }, [isAuthenticated, user, page, search, status, startDate, endDate, authLoading, router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await adminAPI.getPayments(params);
      setPayments(response.data.results);
      setTotal(response.data.count);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      paid: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        icon: FiCheckCircle,
      },
      initiated: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        icon: FiClock,
      },
      failed: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        icon: FiXCircle,
      },
    };
    const badge = badges[status] || badges.initiated;
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
            <p className="text-[#9CA3AF]">View and manage all payment transactions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#048181]"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#048181]"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="initiated">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#048181]"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#048181]"
              placeholder="End Date"
            />
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white hover:border-[#048181] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#334155] border-t-[#048181] rounded-full animate-spin"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9CA3AF]">No payments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1E293B] border-b border-[#334155]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-mono text-sm">
                            {payment.payfast_payment_id || `#${payment.id}`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{payment.user}</p>
                            <p className="text-[#9CA3AF] text-sm">{payment.user_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{payment.course || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#048181] font-bold text-lg">
                            {formatCurrency(payment.amount)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 text-[#9CA3AF] text-sm">
                          {new Date(payment.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between">
                  <p className="text-[#9CA3AF] text-sm">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} payments
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#048181] transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white">
                      Page {page} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#048181] transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}



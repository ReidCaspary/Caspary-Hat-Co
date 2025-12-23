import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { 
  Search, Download, Mail, CheckCircle, XCircle, Calendar, 
  TrendingUp, Users, Percent, RefreshCw, Trash2 
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminNewsletterSubscribers() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl("Home"));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate(createPageUrl("Home"));
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date', 1000),
    enabled: !!user,
  });

  const toggleCodeUsedMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      const updates = {
        code_used: !currentStatus
      };
      if (!currentStatus) {
        updates.code_used_date = new Date().toISOString();
      } else {
        updates.code_used_date = null;
        updates.order_id_used = null;
      }
      return base44.entities.NewsletterSubscriber.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    }
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.NewsletterSubscriber.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    }
  });

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Discount Code', 'Signup Date', 'Code Used', 'Date Used'];
    const csvData = filteredSubscribers.map(sub => [
      sub.first_name,
      sub.last_name,
      sub.email,
      sub.phone || '',
      sub.discount_code,
      format(new Date(sub.created_date), 'yyyy-MM-dd HH:mm'),
      sub.code_used ? 'Yes' : 'No',
      sub.code_used_date ? format(new Date(sub.code_used_date), 'yyyy-MM-dd HH:mm') : ''
    ]);

    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = 
      sub.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "used" && sub.code_used) ||
      (filterStatus === "unused" && !sub.code_used);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: subscribers.length,
    codeUsed: subscribers.filter(s => s.code_used).length,
    conversionRate: subscribers.length > 0 
      ? ((subscribers.filter(s => s.code_used).length / subscribers.length) * 100).toFixed(1)
      : 0
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--gray-medium)]">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--primary)] mb-2">Newsletter Subscribers</h1>
          <p className="text-[var(--gray-medium)]">Manage newsletter signups and discount codes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--gray-medium)] mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--gray-medium)] mb-1">Codes Redeemed</p>
                <p className="text-3xl font-bold text-green-600">{stats.codeUsed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--gray-medium)] mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-[var(--accent)]">{stats.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscribers</SelectItem>
                <SelectItem value="used">Code Used</SelectItem>
                <SelectItem value="unused">Code Not Used</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={exportToCSV}
              variant="outline"
              className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--primary)] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Discount Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Signup Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Code Used</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date Used</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-[var(--gray-medium)]">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {subscriber.first_name} {subscriber.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">{subscriber.email}</td>
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        {subscriber.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-mono font-bold">
                          {subscriber.discount_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        {format(new Date(subscriber.created_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {subscriber.code_used ? (
                          <CheckCircle className="w-5 h-5 text-green-600 inline-block" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 inline-block" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        {subscriber.code_used_date 
                          ? format(new Date(subscriber.code_used_date), 'MMM d, yyyy')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCodeUsedMutation.mutate({
                              id: subscriber.id,
                              currentStatus: subscriber.code_used
                            })}
                            disabled={toggleCodeUsedMutation.isPending}
                            className={subscriber.code_used 
                              ? "border-red-300 text-red-600 hover:bg-red-50"
                              : "border-green-300 text-green-600 hover:bg-green-50"
                            }
                          >
                            {subscriber.code_used ? 'Mark Unused' : 'Mark Used'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this subscriber?')) {
                                deleteSubscriberMutation.mutate(subscriber.id);
                              }
                            }}
                            disabled={deleteSubscriberMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-[var(--gray-medium)] text-center">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </div>
      </div>
    </div>
  );
}
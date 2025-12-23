import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NewsletterSubscriber } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Newsletter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => NewsletterSubscriber.findMany({ limit: 1000 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => NewsletterSubscriber.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    }
  });

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch =
      sub.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase());

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

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Discount Code', 'Signup Date', 'Code Used'];
    const csvData = filteredSubscribers.map(sub => [
      sub.first_name || '',
      sub.last_name || '',
      sub.email,
      sub.phone || '',
      sub.discount_code || '',
      format(new Date(sub.subscribed_at), 'yyyy-MM-dd HH:mm'),
      sub.code_used ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600">Manage email subscribers and discount codes</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Codes Redeemed</p>
              <p className="text-3xl font-bold text-green-600">{stats.codeUsed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-[var(--accent)]">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscribers</SelectItem>
            <SelectItem value="used">Code Used</SelectItem>
            <SelectItem value="unused">Code Not Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Discount Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Signup Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Code Used</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {subscriber.first_name} {subscriber.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{subscriber.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {subscriber.discount_code ? (
                        <span className="inline-block bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-mono font-bold">
                          {subscriber.discount_code}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {subscriber.code_used ? (
                        <CheckCircle className="w-5 h-5 text-green-600 inline-block" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 inline-block" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm('Delete this subscriber?')) {
                            deleteMutation.mutate(subscriber.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Showing {filteredSubscribers.length} of {subscribers.length} subscribers
      </p>
    </div>
  );
}

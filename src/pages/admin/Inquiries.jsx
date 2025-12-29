import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContactInquiry } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Trash2,
  Eye,
  X,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Inquiries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => ContactInquiry.findMany({ limit: 500 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => ContactInquiry.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ContactInquiry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      setSelectedInquiry(null);
    }
  });

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || inquiry.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'contacted': return <Mail className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-orange-100 text-orange-700';
      case 'contacted': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Event Type', 'Quantity', 'Status', 'Date', 'Message'];
    const csvData = filteredInquiries.map(i => [
      i.name,
      i.email,
      i.phone || '',
      i.company || '',
      i.event_type || '',
      i.quantity || '',
      i.status,
      format(new Date(i.created_at), 'yyyy-MM-dd HH:mm'),
      (i.message || '').replace(/"/g, '""')
    ]);

    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
          <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-gray-600">Manage customer inquiries and quote requests</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{inquiries.filter(i => i.status === 'new').length}</p>
          <p className="text-sm text-orange-700">New</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{inquiries.filter(i => i.status === 'contacted').length}</p>
          <p className="text-sm text-blue-700">Contacted</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{inquiries.filter(i => i.status === 'completed').length}</p>
          <p className="text-sm text-green-700">Completed</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{inquiry.name}</p>
                      {inquiry.company && (
                        <p className="text-sm text-gray-500">{inquiry.company}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{inquiry.email}</p>
                      {inquiry.phone && (
                        <p className="text-sm text-gray-500">{inquiry.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{inquiry.event_type || '-'}</p>
                      {inquiry.quantity != null && (
                        <p className="text-sm text-gray-500">{inquiry.quantity} hats</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (window.confirm('Delete this inquiry?')) {
                              deleteMutation.mutate(inquiry.id);
                            }
                          }}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedInquiry.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-[var(--accent)] hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {selectedInquiry.phone ? (
                    <a href={`tel:${selectedInquiry.phone}`} className="font-medium text-[var(--accent)] hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event Type</p>
                  <p className="font-medium">{selectedInquiry.event_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{selectedInquiry.quantity != null ? selectedInquiry.quantity : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hat Style</p>
                  <p className="font-medium">{selectedInquiry.hat_style || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{format(new Date(selectedInquiry.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              {selectedInquiry.message && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <p className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              )}

              {selectedInquiry.file_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Attachment</p>
                  <a
                    href={selectedInquiry.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}

              {selectedInquiry.whiteboard_image_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Whiteboard Design</p>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedInquiry.whiteboard_image_url}
                      alt="Customer whiteboard design"
                      className="w-full h-auto"
                    />
                  </div>
                  <a
                    href={selectedInquiry.whiteboard_image_url}
                    download={`whiteboard-${selectedInquiry.name}-${selectedInquiry.id}.png`}
                    className="inline-flex items-center gap-2 mt-2 text-[var(--accent)] hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download Whiteboard
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Update Status</p>
                <div className="flex gap-2">
                  {['new', 'contacted', 'completed'].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedInquiry.status === status ? 'default' : 'outline'}
                      onClick={() => {
                        updateStatusMutation.mutate({ id: selectedInquiry.id, status });
                        setSelectedInquiry({ ...selectedInquiry, status });
                      }}
                      className={selectedInquiry.status === status ? 'bg-[var(--primary)]' : ''}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

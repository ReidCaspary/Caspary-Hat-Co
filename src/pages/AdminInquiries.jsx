import React, { useState, useEffect } from "react";
import { User, ContactInquiry } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, Trash2, Mail, Phone, Calendar, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

export default function AdminInquiries() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['contact-inquiries'],
    queryFn: () => ContactInquiry.findMany(),
    initialData: [],
    enabled: !!user && user.role === 'admin'
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => ContactInquiry.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ContactInquiry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      setSelectedInquiry(null);
    }
  });

  const downloadWhiteboard = (inquiry) => {
    if (!inquiry.whiteboard_image) return;
    
    const link = document.createElement("a");
    link.href = inquiry.whiteboard_image;
    link.download = `whiteboard-${inquiry.name}-${inquiry.id}.png`;
    link.click();
  };

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[var(--gray-medium)]">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[var(--primary)] mb-4">Contact Inquiries</h1>
          <div className="w-32 h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mb-4" />
          <p className="text-lg text-[var(--gray-medium)]">Manage customer inquiries and whiteboard submissions</p>
        </div>

        {/* Inquiries List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {inquiriesLoading ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">Loading inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-[var(--gray-medium)]">
              No inquiries yet. Check back soon!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--primary)] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Style</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Whiteboard</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[var(--primary)]">{inquiry.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[var(--gray-medium)]">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${inquiry.email}`} className="hover:text-[var(--accent)]">
                              {inquiry.email}
                            </a>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center gap-2 text-[var(--gray-medium)]">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${inquiry.phone}`} className="hover:text-[var(--accent)]">
                                {inquiry.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        {inquiry.subject || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--gray-medium)]">
                        {inquiry.quantity || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inquiry.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: inquiry.id, status: e.target.value })}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[inquiry.status]}`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {inquiry.whiteboard_image ? (
                          <Badge className="bg-[var(--accent)] text-white">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Has Whiteboard
                          </Badge>
                        ) : (
                          <span className="text-xs text-[var(--gray-medium)]">No whiteboard</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {inquiry.whiteboard_image && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadWhiteboard(inquiry)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[var(--primary)]">
                  Inquiry Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)]">Name</label>
                    <p className="text-[var(--gray-medium)]">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)]">Email</label>
                    <p className="text-[var(--gray-medium)]">
                      <a href={`mailto:${selectedInquiry.email}`} className="hover:text-[var(--accent)]">
                        {selectedInquiry.email}
                      </a>
                    </p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <label className="text-sm font-semibold text-[var(--primary)]">Phone</label>
                      <p className="text-[var(--gray-medium)]">
                        <a href={`tel:${selectedInquiry.phone}`} className="hover:text-[var(--accent)]">
                          {selectedInquiry.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)]">Date</label>
                    <p className="text-[var(--gray-medium)]">
                      {format(new Date(selectedInquiry.created_at), 'PPP p')}
                    </p>
                  </div>
                </div>

                {/* Style and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedInquiry.subject && (
                    <div>
                      <label className="text-sm font-semibold text-[var(--primary)] block mb-2">Style</label>
                      <p className="text-[var(--gray-medium)]">{selectedInquiry.subject}</p>
                    </div>
                  )}
                  {selectedInquiry.quantity && (
                    <div>
                      <label className="text-sm font-semibold text-[var(--primary)] block mb-2">Quantity</label>
                      <p className="text-[var(--gray-medium)]">{selectedInquiry.quantity}</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-semibold text-[var(--primary)] block mb-2">Message</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-[var(--gray-medium)] whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>

                {/* Whiteboard */}
                {selectedInquiry.whiteboard_image && (
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)] block mb-2">Design Whiteboard</label>
                    <div className="border-2 border-[var(--primary)]/20 rounded-lg overflow-hidden">
                      <img
                        src={selectedInquiry.whiteboard_image}
                        alt="Customer whiteboard"
                        className="w-full h-auto"
                      />
                    </div>
                    <Button
                      onClick={() => downloadWhiteboard(selectedInquiry)}
                      className="mt-4 bg-[var(--accent)] hover:bg-[var(--primary)] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Whiteboard
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <label className="text-sm font-semibold text-[var(--primary)] block mb-2">Status</label>
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: selectedInquiry.id, status: e.target.value })}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusColors[selectedInquiry.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this inquiry?')) {
                        deleteMutation.mutate(selectedInquiry.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Inquiry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
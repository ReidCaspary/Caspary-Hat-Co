import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ContactInquiry, NewsletterSubscriber } from "@/api/apiClient";
import {
  MessageSquare,
  Mail,
  Image,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => ContactInquiry.findMany({ limit: 100 }),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: () => NewsletterSubscriber.findMany({ limit: 100 }),
  });

  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const recentInquiries = inquiries.slice(0, 5);

  const stats = [
    {
      name: "Total Inquiries",
      value: inquiries.length,
      icon: MessageSquare,
      color: "bg-blue-500",
      link: "/admin/inquiries"
    },
    {
      name: "New Inquiries",
      value: newInquiries,
      icon: Clock,
      color: "bg-orange-500",
      link: "/admin/inquiries"
    },
    {
      name: "Newsletter Subscribers",
      value: subscribers.length,
      icon: Mail,
      color: "bg-green-500",
      link: "/admin/newsletter"
    },
    {
      name: "Codes Redeemed",
      value: subscribers.filter(s => s.code_used).length,
      icon: CheckCircle,
      color: "bg-purple-500",
      link: "/admin/newsletter"
    },
  ];

  const quickLinks = [
    { name: "Contact Inquiries", description: "View and manage customer inquiries", icon: MessageSquare, path: "/admin/inquiries" },
    { name: "Newsletter Subscribers", description: "Manage email subscribers", icon: Mail, path: "/admin/newsletter" },
    { name: "Media Library", description: "Upload and manage images", icon: Image, path: "/admin/media" },
    { name: "Blog Posts", description: "Create and edit blog content", icon: FileText, path: "/admin/blog" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInquiries.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">No inquiries yet</p>
            ) : (
              recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{inquiry.name}</p>
                      <p className="text-sm text-gray-500">{inquiry.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'new' ? 'bg-orange-100 text-orange-700' :
                        inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {inquiry.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[var(--accent)] hover:bg-orange-50/50 transition-all group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[var(--accent)] transition-colors">
                  <link.icon className="w-5 h-5 text-gray-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{link.name}</p>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

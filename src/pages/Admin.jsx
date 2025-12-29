import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User } from "@/api/apiClient";
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Image,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Settings,
  Images,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Contact Inquiries", path: "/admin/inquiries", icon: MessageSquare },
  { name: "Newsletter Subscribers", path: "/admin/newsletter", icon: Mail },
  { name: "Gallery", path: "/admin/gallery", icon: Images },
  { name: "Media Library", path: "/admin/media", icon: Image },
  { name: "Blog Posts", path: "/admin/blog", icon: FileText },
  { name: "Pricing", path: "/admin/pricing", icon: DollarSign },
  { name: "Hat Designer Config", path: "/admin/hat-config", icon: Settings },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // CSS Variables for admin theme
  const adminStyles = `
    :root {
      --primary: rgb(23, 44, 99);
      --accent: rgb(209, 143, 99);
      --navy: rgb(23, 44, 99);
      --black: #000000;
      --white: #ffffff;
      --gray-light: #f8f9fa;
      --gray-medium: #6b7280;
      --gray-dark: #1f2937;
    }
  `;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await User.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate("/Login");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate("/Login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    User.logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <style>{adminStyles}</style>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[var(--primary)] text-white
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold">Caspary Hat Co.</h1>
            <p className="text-sm text-white/60">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-white text-[var(--primary)] font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.name || user?.email}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

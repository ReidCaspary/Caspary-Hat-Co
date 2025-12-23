
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/apiClient";
import { Menu, X, Phone, Mail, MapPin, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsletterPopup from "../components/NewsletterPopup";

const navigationItems = [
{ name: "Home", url: createPageUrl("Home") },
/*{ name: "About", url: createPageUrl("About") },*/
{ name: "Gallery", url: createPageUrl("Gallery") },
{ name: "FAQ", url: createPageUrl("FAQ") },
{ name: "Blog", url: createPageUrl("Blog") },
{ name: "Contact", url: createPageUrl("Contact") }];


export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NewsletterPopup />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        
        :root {
          --primary: rgb(23, 44, 99);
          --accent: rgb(209, 143, 99);
          --black: #000000;
          --white: #ffffff;
          --gray-light: #f8f9fa;
          --gray-medium: #6b7280;
          --gray-dark: #1f2937;
          --header-height: 80px;
          --header-height-scrolled: 64px;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Add padding to main content to prevent header overlap */
        main {
          padding-top: var(--header-height);
        }

        @media (max-width: 1024px) {
          main {
            padding-top: var(--header-height-scrolled);
          }
        }
      `}</style>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-white shadow-md py-3 lg:py-4'}`
        }>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex-shrink-0 transition-transform hover:scale-105">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68fd302d608e38f4f8a41fca/6f6ecea63_LOGO.png"
                alt="Caspary Hat Co."
                className={`transition-all duration-300 ${scrolled ? 'h-8 lg:h-10' : 'h-10 lg:h-14'}`} />

            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) =>
              <Link
                key={item.name}
                to={item.url}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors relative group text-[var(--primary)] ${
                location.pathname === item.url ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                }>

                  {item.name}
                  <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--accent)] transform origin-left transition-transform ${
                  location.pathname === item.url ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
                  } />

                </Link>
              )}
              {user && user.role === 'admin' &&
              <>
                  <Link
                  to={createPageUrl("MediaLibrary")}
                  className={`text-sm font-semibold tracking-wide uppercase transition-colors relative group text-[var(--primary)] ${
                  location.pathname === createPageUrl("MediaLibrary") ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                  }>

                    Media
                    <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--accent)] transform origin-left transition-transform ${
                    location.pathname === createPageUrl("MediaLibrary") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
                    } />

                  </Link>
                  <Link
                  to={createPageUrl("AdminInquiries")}
                  className={`text-sm font-semibold tracking-wide uppercase transition-colors relative group text-[var(--primary)] ${
                  location.pathname === createPageUrl("AdminInquiries") ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                  }>

                    Inquiries
                    <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--accent)] transform origin-left transition-transform ${
                    location.pathname === createPageUrl("AdminInquiries") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
                    } />

                  </Link>
                  <Link
                  to={createPageUrl("AdminNewsletterSubscribers")}
                  className={`text-sm font-semibold tracking-wide uppercase transition-colors relative group text-[var(--primary)] ${
                  location.pathname === createPageUrl("AdminNewsletterSubscribers") ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`
                  }>

                    Newsletter
                    <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--accent)] transform origin-left transition-transform ${
                    location.pathname === createPageUrl("AdminNewsletterSubscribers") ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
                    } />

                  </Link>
                  </>
                  }
            </nav>

            <div className="hidden lg:block">
              <Link to={createPageUrl("Contact")}>
                <Button className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-semibold px-4 lg:px-6 py-2 lg:py-3 text-sm rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get Quote
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors text-[var(--primary)]">

              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen &&
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              {navigationItems.map((item) =>
            <Link
              key={item.name}
              to={item.url}
              className={`block text-base font-semibold tracking-wide uppercase transition-colors ${
              location.pathname === item.url ?
              'text-[var(--primary)]' :
              'text-[var(--gray-dark)] hover:text-[var(--accent)]'}`
              }>

                  {item.name}
                </Link>
            )}
              {user && user.role === 'admin' &&
            <>
                  <Link
                to={createPageUrl("MediaLibrary")}
                className={`block text-base font-semibold tracking-wide uppercase transition-colors ${
                location.pathname === createPageUrl("MediaLibrary") ?
                'text-[var(--primary)]' :
                'text-[var(--gray-dark)] hover:text-[var(--accent)]'}`
                }>

                    Media Library
                  </Link>
                  <Link
                to={createPageUrl("AdminInquiries")}
                className={`block text-base font-semibold tracking-wide uppercase transition-colors ${
                location.pathname === createPageUrl("AdminInquiries") ?
                'text-[var(--primary)]' :
                'text-[var(--gray-dark)] hover:text-[var(--accent)]'}`
                }>

                    Inquiries
                  </Link>
                  <Link
                to={createPageUrl("AdminNewsletterSubscribers")}
                className={`block text-base font-semibold tracking-wide uppercase transition-colors ${
                location.pathname === createPageUrl("AdminNewsletterSubscribers") ?
                'text-[var(--primary)]' :
                'text-[var(--gray-dark)] hover:text-[var(--accent)]'}`
                }>

                    Newsletter
                  </Link>
                </>
            }
              <Link to={createPageUrl("Contact")} className="block pt-2">
                <Button className="w-full bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-semibold py-3 rounded-lg transition-all duration-300">
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        }
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--primary)] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-black opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68fd302d608e38f4f8a41fca/6f6ecea63_LOGO.png"
                alt="Caspary Hat Co."
                className="h-12 lg:h-14 w-auto mb-4 lg:mb-6 brightness-100" />

              <p className="text-gray-300 mb-4 lg:mb-6 max-w-md leading-relaxed text-sm lg:text-base">
                Crafting custom baseball caps with Texas pride — perfect for your event, built to be remembered. 
                Each piece reflects our commitment to exceptional craftsmanship and personalized service.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--accent)] flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--accent)] flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--accent)] flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-bold mb-4 lg:mb-6 text-[var(--accent)]">Quick Links</h3>
              <ul className="space-y-2 lg:space-y-3 text-sm lg:text-base">
                <li><Link to={createPageUrl("Contact")} className="text-gray-300 hover:text-[var(--accent)] transition-colors">Contact</Link></li>
                <li><Link to={createPageUrl("FAQ")} className="text-gray-300 hover:text-[var(--accent)] transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-bold mb-4 lg:mb-6 text-[var(--accent)]">Contact</h3>
              <ul className="space-y-3 lg:space-y-4 text-sm lg:text-base">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-[var(--accent)] flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Houston, Tx</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--accent)]" />
                  <a href="tel:+12818148024" className="text-gray-300 hover:text-[var(--accent)] transition-colors">
                    (281) 814-8024
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--accent)]" />
                  <a href="mailto:info@casparyhatco.com" className="text-gray-300 hover:text-[var(--accent)] transition-colors">sales@casparyhats.com

                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 lg:mt-12 pt-6 lg:pt-8 text-center">
            <button
              onClick={() => window.dispatchEvent(new Event("openNewsletterPopup"))}
              className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-white transition-colors mb-4 font-semibold"
            >
              <Gift className="w-5 h-5" />
              Get 20% Off Your First Order
            </button>
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Caspary Hat Co. All rights reserved. Designed in Texas.</p>
          </div>
        </div>
      </footer>
    </div>);

}

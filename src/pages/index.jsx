import Layout from "./Layout.jsx";

import Home from "./Home";

import About from "./About";

import Gallery from "./Gallery";

import Products from "./Products";

import Blog from "./Blog";

import Contact from "./Contact";

import FAQ from "./FAQ";

import MediaLibrary from "./MediaLibrary";

import AdminInquiries from "./AdminInquiries";

import AdminNewsletterSubscribers from "./AdminNewsletterSubscribers";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    About: About,
    
    Gallery: Gallery,
    
    Products: Products,
    
    Blog: Blog,
    
    Contact: Contact,
    
    FAQ: FAQ,
    
    MediaLibrary: MediaLibrary,
    
    AdminInquiries: AdminInquiries,
    
    AdminNewsletterSubscribers: AdminNewsletterSubscribers,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/MediaLibrary" element={<MediaLibrary />} />
                
                <Route path="/AdminInquiries" element={<AdminInquiries />} />
                
                <Route path="/AdminNewsletterSubscribers" element={<AdminNewsletterSubscribers />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
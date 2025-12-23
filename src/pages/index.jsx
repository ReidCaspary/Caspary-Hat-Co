import Layout from "./Layout.jsx";

import Home from "./Home";
import About from "./About";
import Gallery from "./Gallery";
import Products from "./Products";
import Blog from "./Blog";
import Contact from "./Contact";
import FAQ from "./FAQ";
import Login from "./Login";
import Designer from "./Designer";

// Admin imports
import Admin from "./Admin";
import Dashboard from "./admin/Dashboard";
import Inquiries from "./admin/Inquiries";
import Newsletter from "./admin/Newsletter";
import Media from "./admin/Media";
import BlogAdmin from "./admin/BlogAdmin";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Home: Home,
    About: About,
    Gallery: Gallery,
    Products: Products,
    Blog: Blog,
    Contact: Contact,
    FAQ: FAQ,
    Login: Login,
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

// Public pages with main Layout
function PublicContent() {
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
                <Route path="/Login" element={<Login />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <Routes>
                {/* Admin routes - no main layout */}
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<Dashboard />} />
                    <Route path="inquiries" element={<Inquiries />} />
                    <Route path="newsletter" element={<Newsletter />} />
                    <Route path="media" element={<Media />} />
                    <Route path="blog" element={<BlogAdmin />} />
                </Route>

                {/* Designer - standalone page without main layout */}
                <Route path="/designer" element={<Designer />} />

                {/* Public routes with main layout */}
                <Route path="/*" element={<PublicContent />} />
            </Routes>
        </Router>
    );
}

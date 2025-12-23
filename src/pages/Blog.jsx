import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@/api/apiClient";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, User, ArrowRight, ChevronDown, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const categories = [
  { value: "all", label: "All Articles" },
  { value: "style_tips", label: "Style Tips" },
  { value: "hat_care", label: "Hat Care" },
  { value: "company_news", label: "Company News" },
  { value: "hat_history", label: "Hat History" }
];

const faqItems = [
  {
    question: "What's the minimum order quantity for custom hats?",
    answer: "We work with orders of all sizes, from small batches to large corporate runs. Our typical minimum is 20-24 hats, but we can accommodate smaller orders for special circumstances. Contact us to discuss your specific needs."
  },
  {
    question: "How long does production take?",
    answer: "Standard production time is 4-6 weeks from final design approval. This includes design consultation, sampling, full production, and quality control. Rush orders are available with advance notice and appropriate scheduling."
  },
  {
    question: "Can I send my own logo for embroidery?",
    answer: "Absolutely! We work with your existing logos and artwork. For best results, provide vector files (AI, EPS, or PDF) or high-resolution raster files (PNG or JPG at 300 DPI minimum). Our design team will optimize your files for embroidery."
  },
  {
    question: "Where are Caspary hats made?",
    answer: "We're proudly based in Texas, where we design, customize, and quality-check every hat. We use premium Richardson base hats and work with trusted domestic manufacturers for embroidery and patches, ensuring consistent Texas-quality craftsmanship."
  },
  {
    question: "Do you ship nationwide?",
    answer: "Yes! We ship custom hats throughout the United States. Shipping costs and times vary by location and order size. Texas customers benefit from faster shipping and potential cost savings."
  },
  {
    question: "Can I get a sample before ordering in bulk?",
    answer: "Yes, and we highly recommend it for large orders. Sample fees are typically credited toward your final order. Seeing and feeling the actual product ensures you're completely satisfied before committing to full production."
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const location = useLocation();

  // Get the post slug from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const postSlug = urlParams.get('post');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: () => BlogPost.findMany({
      category: selectedCategory !== "all" ? selectedCategory : undefined
    }),
    initialData: [],
  });

  // Fetch individual post if slug is present
  const { data: singlePost, isLoading: singlePostLoading } = useQuery({
    queryKey: ['blog-post', postSlug],
    queryFn: () => BlogPost.findBySlug(postSlug),
    enabled: !!postSlug,
  });

  // If viewing a single post
  if (postSlug) {
    if (singlePostLoading) {
      return (
        <div className="min-h-screen bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      );
    }

    if (!singlePost) {
      return (
        <div className="min-h-screen bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-[var(--primary)] mb-4">Post Not Found</h1>
            <p className="text-[var(--gray-medium)] mb-8">The blog post you're looking for doesn't exist.</p>
            <Link to={createPageUrl("Blog")}>
              <Button className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // Render single blog post
    useEffect(() => {
      if (singlePost) {
        document.title = singlePost.meta_title || singlePost.title;
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = "description";
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = singlePost.meta_description || singlePost.excerpt || '';
        
        if (singlePost.keywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = "keywords";
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = singlePost.keywords;
        }
      }
    }, [singlePost]);

    return (
      <div className="min-h-screen bg-white">
        {/* Article Header */}
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
          {singlePost.image_url && (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${singlePost.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-[var(--navy)]/80" />
            </div>
          )}
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <div className="mb-4">
              {singlePost.category && (
                <span className="inline-block px-4 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-full">
                  {singlePost.category.replace(/_/g, ' ').toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {singlePost.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(singlePost.created_at), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to={createPageUrl("Blog")}>
              <Button variant="ghost" className="mb-8 text-[var(--primary)] hover:text-[var(--accent)]">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to All Articles
              </Button>
            </Link>

            {/* Article Body */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:text-[var(--primary)] prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-[var(--gray-medium)] prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[var(--primary)] prose-strong:font-bold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                prose-li:text-[var(--gray-medium)] prose-li:mb-2"
              dangerouslySetInnerHTML={{ __html: singlePost.content }}
            />

            {/* Share Section */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">Share This Article</h3>
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>

            {/* Related CTA */}
            <div className="mt-16 bg-gradient-to-r from-[var(--primary)] to-[var(--navy)] rounded-2xl p-8 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Ready to Create Your Custom Hats?</h3>
              <p className="text-lg mb-6 opacity-90">
                Transform your vision into reality with Caspary Hat Co.'s Texas-made quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Contact")}>
                  <Button size="lg" className="bg-[var(--accent)] hover:bg-white hover:text-[var(--primary)] text-white">
                    Get a Custom Quote
                  </Button>
                </Link>
                <Link to={createPageUrl("Gallery")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--primary)]">
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Featured post (most recent)
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  // Original blog list view
  return (
    <div>
      {/* SEO-Optimized Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2070)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-[var(--navy)]/80" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-blue-950 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6">
            Custom Hat Design & Care: Expert Insights from Texas
          </h1>
          <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-gradient-to-r from-[var(--accent)] to-white rounded-full mx-auto mb-4 sm:mb-6" />
          <p className="text-blue-950 text-sm sm:text-base lg:text-xl xl:text-2xl leading-relaxed">
            Discover the craftsmanship, creativity, and care behind every Caspary Hat Co. creation. 
            From wedding hats that become keepsakes to corporate gifts that drive ROI, learn how custom hats 
            elevate events, build brands, and create lasting memories.
          </p>
        </div>
      </section>

      {/* About Caspary Hat Co. Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--primary)] mb-4 sm:mb-6">
            Texas-Made Custom Hats with Heart
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--accent)] mx-auto mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base lg:text-lg text-[var(--gray-medium)] leading-relaxed mb-6 sm:mb-8">
            At Caspary Hat Co., we believe custom hats should tell stories, create connections, and last for years. 
            Every hat we create is crafted in Texas with precision embroidery, quality materials, and genuine care. 
            Whether you're planning a wedding, building a brand, or celebrating a milestone, we transform your vision 
            into wearable art that people actually want to keep.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <h3 className="font-bold text-[var(--primary)] mb-2">🎨 Expert Craftsmanship</h3>
              <p className="text-sm sm:text-base text-[var(--gray-medium)]">Hand-inspected embroidery and patches that exceed industry standards</p>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <h3 className="font-bold text-[var(--primary)] mb-2">🤠 Texas Heritage</h3>
              <p className="text-sm sm:text-base text-[var(--gray-medium)]">Proudly designed and customized in the heart of Texas</p>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
              <h3 className="font-bold text-[var(--primary)] mb-2">💼 Versatile Solutions</h3>
              <p className="text-sm sm:text-base text-[var(--gray-medium)]">From weddings to corporate gifts, events to team gear</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 sm:py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className={selectedCategory === cat.value 
                  ? "bg-[var(--primary)] text-white" 
                  : "text-[var(--primary)] border-[var(--primary)]"}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!isLoading && featuredPost && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-full">
                ⭐ Featured Article
              </span>
            </div>
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {featuredPost.image_url && (
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group">
                  <img
                    src={featuredPost.image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {featuredPost.category && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-3 py-1 bg-[var(--accent)] text-white text-sm font-semibold rounded-full">
                        {featuredPost.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div>
                <div className="flex items-center gap-4 text-sm text-[var(--gray-medium)] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(featuredPost.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-[var(--black)] mb-4 hover:text-[var(--accent)] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-[var(--gray-medium)] mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <Link to={`${createPageUrl("Blog")}?post=${featuredPost.slug}`}>
                  <Button className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold">
                    Read Full Article
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">Latest Articles</h2>
            <div className="w-24 h-1 bg-[var(--accent)] mx-auto" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : regularPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-[var(--gray-medium)] mb-6">
                No articles found in this category. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {post.image_url && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {post.category && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-block px-3 py-1 bg-[var(--accent)] text-white text-sm font-semibold rounded-full">
                            {post.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-[var(--gray-medium)] mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--black)] mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[var(--gray-medium)] mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Link to={`${createPageUrl("Blog")}?post=${post.slug}`}>
                      <Button variant="ghost" className="text-[var(--accent)] hover:text-[var(--navy)] p-0 h-auto group/btn">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEO-Optimized FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white" itemScope itemType="https://schema.org/FAQPage">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">
              Frequently Asked Questions About Custom Hats
            </h2>
            <div className="w-24 h-1 bg-[var(--accent)] mx-auto mb-6" />
            <p className="text-lg text-[var(--gray-medium)]">
              Everything you need to know about ordering custom hats from Caspary Hat Co.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg overflow-hidden shadow-md"
                itemScope 
                itemProp="mainEntity" 
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-bold text-[var(--primary)] pr-4" itemProp="name">
                    {item.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--accent)] flex-shrink-0 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {expandedFAQ === index && (
                  <div 
                    className="px-6 pb-5" 
                    itemScope 
                    itemProp="acceptedAnswer" 
                    itemType="https://schema.org/Answer"
                  >
                    <p className="text-[var(--gray-medium)] leading-relaxed" itemProp="text">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-[var(--gray-medium)] mb-6">
              Have more questions about custom hats?
            </p>
            <Link to={createPageUrl("FAQ")}>
              <Button className="bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold mr-4">
                View Full FAQ
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-[var(--primary)] to-[var(--navy)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Create Your Custom Hats?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're planning a wedding, building your brand, or celebrating an event, 
            Caspary Hat Co. brings your vision to life with Texas-made quality and craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-[var(--accent)] hover:bg-white hover:text-[var(--primary)] text-white font-bold px-8">
                Get a Custom Quote
              </Button>
            </Link>
            <Link to={createPageUrl("Gallery")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--primary)]">
                View Design Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
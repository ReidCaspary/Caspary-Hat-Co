
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqCategories = [
{
  category: "Customization Process",
  questions: [
  {
    question: "What customization options are available?",
    answer: "We offer complete customization including embroidery (text, logos, designs), custom patches (woven or embroidered), color selection for fabric and mesh, different closure types, and material choices. Every detail can be tailored to your vision."
  },
  {
    question: "How do I submit my design for customization?",
    answer: "Contact us through our quote form with details about your project. You can upload logo files, describe your design ideas, specify colors, and share any reference images. We'll work with you to create mockups before production begins."
  },
  {
    question: "Can you match specific colors or logos?",
    answer: "Yes! We can match specific Pantone colors and recreate logos with high precision. Send us your brand guidelines or logo files (preferably vector format like AI, EPS, or high-resolution PNG), and we'll ensure perfect color matching and design accuracy."
  },
  {
    question: "What's the difference between embroidery and patches?",
    answer: "Embroidery involves stitching designs directly onto the cap fabric - ideal for text, simple logos, and clean designs. Patches are created separately and sewn on, perfect for detailed artwork, complex logos, and vintage aesthetics. We can help you choose the best method for your design."
  }]

},
{
  category: "Orders & Pricing",
  questions: [
  {
    question: "What's the minimum order quantity?",
    answer: "Minimum order quantity is 144 (12 Dozen) hats"
  },
  {
    question: "How much do custom haps cost?",
    answer: "Pricing varies based on customization complexity, order quantity, materials, and design details. Generally, larger orders receive better per-unit pricing. Contact us with your project details for a custom quote tailored to your needs."
  },
  {
    question: "Do you offer bulk order discounts?",
    answer: "Yes! We offer competitive pricing for bulk orders. The more caps you order, the better the per-unit price. Contact us with your quantity needs for a detailed quote."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards, debit cards, and can arrange invoicing for corporate orders. Payment terms can be discussed for larger orders."
  }]

},
{
  category: "Production & Shipping",
  questions: [
  {
    question: "How long does production take?",
    answer: "Production time varies based on order size and complexity. Typical turnaround is 2-4 weeks for standard custom orders. Rush orders may be available for an additional fee - contact us to discuss your timeline and we'll do our best to accommodate."
  },
  {
    question: "Can I get a sample before placing a large order?",
    answer: "Yes! We recommend ordering samples for large projects. Sample fees are typically credited toward your final order. This allows you to see and feel the quality before committing to a full production run."
  },
  {
    question: "Do you ship nationwide?",
    answer: "Yes, we ship custom baseball caps throughout the United States. Shipping costs vary based on order size and destination. We can provide shipping estimates with your quote."
  },
  {
    question: "What if I need my order by a specific date?",
    answer: "Contact us as early as possible with your deadline. We'll let you know if we can meet it and discuss any rush fees if applicable. The more lead time you provide, the better we can accommodate your timeline."
  }]

},
{
  category: "Cap Care & Maintenance",
  questions: [
  {
    question: "How do I care for my custom embroidered caps?",
    answer: "Hand wash with mild soap and cool water, avoiding harsh scrubbing on embroidered areas. Air dry naturally - never use a dryer. Store caps upside down or on a cap rack to maintain shape. Avoid prolonged direct sunlight exposure to prevent fading."
  },
  {
    question: "Can embroidered caps be machine washed?",
    answer: "We strongly recommend against machine washing. The agitation can damage embroidery threads, distort the cap structure, and fade colors. Hand washing is always the safest method for preserving your custom caps."
  },
  {
    question: "How long will the embroidery last?",
    answer: "With proper care, high-quality embroidery can last for years. Our embroidery is designed to withstand regular wear and cleaning when cared for correctly. Avoid harsh chemicals and excessive heat to maximize longevity."
  },
  {
    question: "What if my cap gets stained?",
    answer: "Treat stains as soon as possible. Use a soft brush with mild soap and cool water, gently working on the stained area. For stubborn stains, consider professional cap cleaning services. Never use bleach or harsh chemicals."
  }]

},
{
  category: "Design & Style",
  questions: [
  {
    question: "What cap styles do you offer?",
    answer: "We specialize in various styles including classic trucker, mesh back, snapbacks, flatbills, low profile, performance mesh, and more. Each style can be fully customized with your design."
  },
  {
    question: "Can I customize the underbill of the cap?",
    answer: "Yes! Underbill customization is available. Popular options include custom colors, patterns, or even printed designs. This adds a unique touch that's visible when the cap is worn or displayed."
  },
  {
    question: "What colors are available?",
    answer: "We offer a wide range of fabric and mesh colors. From classic black, white, and navy to vibrant colors and even camo patterns. Contact us to discuss specific color options for your project."
  }]

}];


function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
        
        <h3 className="text-lg font-semibold text-[var(--black)] pr-4">
          {question}
        </h3>
        {isOpen ?
        <ChevronUp className="w-5 h-5 text-[var(--orange)] flex-shrink-0" /> :

        <ChevronDown className="w-5 h-5 text-[var(--gray-medium)] flex-shrink-0" />
        }
      </button>
      {isOpen &&
      <div className="px-6 pb-5">
          <p className="text-[var(--gray-medium)] leading-relaxed">
            {answer}
          </p>
        </div>
      }
    </div>);

}

export default function FAQ() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-48 sm:h-64 lg:h-96 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2070)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          
          <div className="absolute inset-0 bg-[var(--navy)]/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-blue-950 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto mb-3 sm:mb-4" />
          <p className="text-blue-950 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">Everything you need to know about custom baseball caps
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12">
            {faqCategories.map((category, idx) =>
            <div key={idx}>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--black)] mb-2">
                    {category.category}
                  </h2>
                  <div className="w-12 sm:w-16 h-1 bg-[var(--orange)]" />
                </div>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {category.questions.map((item, qIdx) =>
                <FAQItem
                  key={qIdx}
                  question={item.question}
                  answer={item.answer} />

                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-[var(--gray-light)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--black)] mb-3 sm:mb-4">
            Still Have Questions?
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto mb-4 sm:mb-6" />
          <p className="text-sm sm:text-base lg:text-lg text-[var(--gray-medium)] mb-6 sm:mb-8">
            Can't find what you're looking for? Our team is here to help answer any questions 
            about custom baseball caps, design options, or your specific project needs.
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button size="lg" className="bg-[var(--orange)] text-slate-900 px-6 sm:px-8 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-[var(--orange)]/90">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--black)] mb-3 sm:mb-4">
              Quick Tips for Your Custom Order
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[var(--gray-light)] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">
                Provide High-Quality Files
              </h3>
              <p className="text-[var(--gray-medium)]">
                Vector files (AI, EPS) work best for embroidery. If you only have raster files, 
                provide the highest resolution possible (PNG or JPG at 300 DPI minimum).
              </p>
            </div>

            <div className="bg-[var(--gray-light)] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">
                Order Early
              </h3>
              <p className="text-[var(--gray-medium)]">
                Allow 3-5 weeks for production, plus shipping time. The earlier you order, 
                the more flexibility we have to perfect your design and meet your deadline.
              </p>
            </div>

            <div className="bg-[var(--gray-light)] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">
                Request a Sample
              </h3>
              <p className="text-[var(--gray-medium)]">
                For large orders, getting a sample first ensures you're completely satisfied 
                with colors, materials, and design before full production.
              </p>
            </div>

            <div className="bg-[var(--gray-light)] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">
                Be Specific
              </h3>
              <p className="text-[var(--gray-medium)]">
                The more details you provide about colors, placement, sizing, and design elements, 
                the better we can bring your vision to life exactly as you imagine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>);

}

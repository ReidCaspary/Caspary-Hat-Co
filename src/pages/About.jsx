
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { MapPin, Award, Target, Users } from "lucide-react";

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://base44.app/api/apps/68fd32ad207158d022276aa4/files/public/68fd32ad207158d022276aa4/40f87f033_WhatsAppImage2025-12-02at120041_2d78ec02.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-[var(--navy)]/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Story</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto" />
        </div>
      </section>

      {/* History Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--black)] mb-4 lg:mb-6">
                Masters of Custom Baseball Cap Design
              </h2>
              <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mb-4 lg:mb-6" />
              <div className="space-y-3 lg:space-y-4 text-base lg:text-lg text-[var(--gray-medium)] leading-relaxed">
                <p>
                  Caspary Hat Co. specializes in creating custom Richardson 112-style trucker caps and baseball hats 
                  that are built exactly to your specifications. Based in Texas, we've built our reputation on delivering 
                  exceptional quality custom headwear with a personal touch.
                </p>
                <p>
                  Our expertise lies in transforming your vision into reality. Whether you need custom embroidery, 
                  unique patches, specific color combinations, or branded designs for your team or business, we handle 
                  every detail with precision and care.
                </p>
                <p>
                  From small batch orders to large corporate runs, we treat every project with the same level of 
                  attention and quality. Our customization process allows you to control every aspect of your hat's 
                  design—from the fabric and mesh selection to the exact placement of logos and text.
                </p>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=1000"
                alt="Custom baseball hats"
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -bottom-4 -left-4 lg:-bottom-8 lg:-left-8 w-32 h-32 lg:w-64 lg:h-64 bg-[var(--orange)] opacity-10 rounded-lg -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[var(--gray-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--black)] mb-4">
              Why Choose Us for Custom Baseball Caps
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mx-auto mb-4 lg:mb-6" />
            <p className="text-base lg:text-lg text-[var(--gray-medium)] max-w-3xl mx-auto px-4">
              We combine Texas craftsmanship with modern customization technology to deliver exactly what you envision
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-white rounded-lg p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--orange)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-[var(--black)] mb-3">Full Customization</h3>
              <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                Complete control over embroidery, patches, colors, and materials. Your vision, exactly as you want it.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--navy)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--navy)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-[var(--black)] mb-3">Texas Based</h3>
              <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                Proudly operating from Texas, bringing quality craftsmanship and personalized service to every order.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--orange)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-[var(--black)] mb-3">Precision Work</h3>
              <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                Expert embroidery and patch application with attention to every detail for professional results.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--navy)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--navy)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-[var(--black)] mb-3">Personal Service</h3>
              <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                We work directly with you from concept to completion, ensuring satisfaction at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1000"
                alt="Custom embroidery options"
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -top-4 -right-4 lg:-top-8 lg:-right-8 w-32 h-32 lg:w-64 lg:h-64 bg-[var(--navy)] opacity-10 rounded-lg -z-10" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--black)] mb-4 lg:mb-6">
                Endless Customization Options
              </h2>
              <div className="w-16 sm:w-20 lg:w-24 h-1 bg-[var(--orange)] mb-4 lg:mb-6" />
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-[var(--orange)] rounded-full mt-2" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[var(--black)] mb-2">
                      Custom Embroidery
                    </h3>
                    <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                      Precision embroidery with your choice of text, logos, fonts, and thread colors.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-[var(--orange)] rounded-full mt-2" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[var(--black)] mb-2">
                      Custom Patches
                    </h3>
                    <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                      Woven or embroidered patches in any design, perfect for logos and unique artwork.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-[var(--orange)] rounded-full mt-2" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[var(--black)] mb-2">
                      Color Combinations
                    </h3>
                    <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                      Choose from a wide range of fabric colors for the front panels, mesh back, and bill.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-[var(--orange)] rounded-full mt-2" />
                  <div>
                    <h3 className="text-lg lg:text-xl font-semibold text-[var(--black)] mb-2">
                      Material Selection
                    </h3>
                    <p className="text-sm lg:text-base text-[var(--gray-medium)]">
                      Select from premium materials including foam fronts, mesh backs, and adjustable closures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[var(--navy)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
            Ready to Create Your Custom Baseball Caps?
          </h2>
          <p className="text-base lg:text-xl text-gray-300 mb-6 lg:mb-8">
            Let's bring your vision to life with quality custom trucker caps designed exactly how you want them
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Products")}>
              <Button size="lg" className="w-full sm:w-auto bg-[var(--orange)] hover:bg-[var(--orange)]/90 text-white px-6 lg:px-8">
                Start Customizing
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[var(--navy)] px-6 lg:px-8">
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

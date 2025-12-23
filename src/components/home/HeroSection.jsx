import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-0">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://base44.app/api/apps/68fd32ad207158d022276aa4/files/public/68fd32ad207158d022276aa4/40f87f033_WhatsAppImage2025-12-02at120041_2d78ec02.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '50% 50%'
        }}>

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-[var(--primary)]/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white py-12 lg:py-0">
        <div className="max-w-4xl animate-fade-in">
          <div className="mb-6 lg:mb-8">
            <span className="inline-block px-4 lg:px-6 py-2 lg:py-3 bg-[var(--accent)] text-white text-xs lg:text-sm font-bold tracking-widest uppercase rounded-full shadow-xl">
              CUSTOM HATS - DESIGNED FOR YOU
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 lg:mb-8 leading-tight whitespace-nowrap">Fully Custom Hats</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 lg:mb-12 max-w-3xl leading-relaxed font-medium">Crafting custom hats with Texas pride — perfect for your event, built to be remembered. Each piece reflects our commitment to exceptional craftsmanship and personalized service.

          </p>
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <Link to={createPageUrl("Contact")}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold px-6 lg:px-10 py-5 lg:py-7 text-base lg:text-lg rounded-lg transition-all duration-300 shadow-2xl hover:shadow-[var(--accent)]/50 transform hover:-translate-y-1 group">

                Start Customizing
                <ArrowRight className="ml-2 lg:ml-3 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link to={createPageUrl("Gallery")}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-[var(--primary)] px-6 lg:px-10 py-5 lg:py-7 text-base lg:text-lg font-bold rounded-lg transition-all duration-300">

                View Custom Designs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden lg:block">
        <div className="w-6 h-10 lg:w-8 lg:h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 lg:w-2 lg:h-4 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>);

}
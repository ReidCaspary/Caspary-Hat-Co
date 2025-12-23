import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const products = [
{
  name: "The Classic",
  category: "Mesh Back",
  image: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
  description: "Classic Trucker Hat with Mesh Back. Available in 5 or 6 Panels"
},
{
  name: "The Caddie",
  category: "All Fabric",
  image: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
  description: "Classic Rope Hat With Mesh or Fabric Back"
},
{
  name: "The Corduroy",
  category: "Throwback Style",
  image: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517513/100_Cotton_gmcwn1.jpg",
  description: "100% Cotton Front with Mesh Back. Goes Great with a Patch"
}];


export default function FeaturedProducts() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[var(--primary)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.03) 10px, rgba(255,255,255,.03) 20px)'
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 lg:mb-6">
            Custom Hat Styles
          </h2>
          <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-[var(--accent)] mx-auto mb-4 sm:mb-6 lg:mb-8 rounded-full" />
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">START HERE! 

Choose your base style and customize every detail - from embroidery placement to patch designs and color combinations</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {products.map((product, index) =>
          <div
            key={index}
            className="group bg-white rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl hover:shadow-[var(--accent)]/50 transition-all duration-300 transform hover:-translate-y-2">

              <div className="relative h-32 sm:h-48 md:h-64 lg:h-80 overflow-hidden">
                <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/90 via-[var(--primary)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                  <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 lg:px-4 lg:py-2 bg-[var(--accent)] text-white text-[10px] sm:text-xs lg:text-sm font-bold rounded-full shadow-lg">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-4 md:p-6 lg:p-8">
                <h3 className="text-xs sm:text-base md:text-lg lg:text-2xl font-black text-[var(--primary)] mb-1 sm:mb-2 lg:mb-3">{product.name}</h3>
                <p className="text-[10px] sm:text-sm md:text-base text-[var(--gray-medium)] mb-2 sm:mb-4 lg:mb-6 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">{product.description}</p>
                <Link to={`${createPageUrl("Contact")}?style=${encodeURIComponent(product.name)}`}>
                  <Button
                  variant="ghost"
                  className="text-[var(--accent)] hover:text-[var(--primary)] font-bold p-0 h-auto group/btn text-[10px] sm:text-sm lg:text-base hidden sm:flex">

                    Customize This Style
                    <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Gallery")}>
            <Button
              size="lg"
              className="bg-white hover:bg-[var(--accent)] text-[var(--primary)] hover:text-white font-bold px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-7 text-xs sm:text-sm lg:text-lg rounded-lg transition-all duration-300 shadow-2xl transform hover:-translate-y-1">

              Explore All Customization Options
              <ArrowRight className="ml-1 sm:ml-2 lg:ml-3 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </section>);

}
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const products = [
{
  name: "Richardson 112 Trucker",
  category: "Classic Mesh",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800",
  description: "Classic trucker cap with mesh back and foam front",
  features: ["Custom embroidery", "Patch options", "Color choices", "Mesh back"]
},
{
  name: "Snapback Pro",
  category: "All Fabric",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=800",
  description: "Premium snapback with structured front panel",
  features: ["Embroidered logos", "3D puff option", "Multiple colors", "Snapback closure"]
},
{
  name: "Flatbill Custom",
  category: "Urban Style",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800",
  description: "Modern flatbill design with customization options",
  features: ["Flat bill style", "Custom patches", "Text embroidery", "Color blocking"]
},
{
  name: "Low Profile Cap",
  category: "Casual",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800",
  description: "Relaxed fit low profile baseball cap",
  features: ["Low crown", "Unstructured", "Custom designs", "Adjustable strap"]
},
{
  name: "Performance Mesh",
  category: "Athletic",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=800",
  description: "Breathable performance cap for active wear",
  features: ["Moisture wicking", "Full mesh", "Lightweight", "Team customization"]
},
{
  name: "Retro Trucker",
  category: "Vintage Style",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800",
  description: "Vintage-inspired trucker cap with custom options",
  features: ["Retro fit", "Patch ready", "Distressed option", "Classic mesh"]
},
{
  name: "Rope Hat",
  category: "Premium",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800",
  description: "Premium rope hat with sophisticated look",
  features: ["Rope detail", "Premium fabric", "Custom embroidery", "Structured front"]
},
{
  name: "Camo Custom",
  category: "Outdoor",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=800",
  description: "Camouflage pattern with custom branding",
  features: ["Camo options", "Custom logos", "Outdoor ready", "Durable build"]
},
{
  name: "Two-Tone Trucker",
  category: "Color Design",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800",
  description: "Eye-catching two-tone color combinations",
  features: ["Color blocking", "Custom colors", "Mesh back", "Bold designs"]
},
{
  name: "Flex Fit Custom",
  category: "Comfort Fit",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800",
  description: "Comfortable flex fit with custom options",
  features: ["Flex technology", "No adjustment", "Premium feel", "Custom embroidery"]
},
{
  name: "Youth Size Custom",
  category: "Youth",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=800",
  description: "Youth-sized caps with same custom options",
  features: ["Youth fit", "Team designs", "Safe materials", "Full customization"]
},
{
  name: "Visor Style",
  category: "Alternative",
  price: "Custom Quote",
  image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800",
  description: "Open-top visor with custom branding",
  features: ["Open top", "Custom logos", "Lightweight", "Adjustable"]
}];


export default function Products() {
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = filter === "All" ?
  products :
  products.filter((p) => p.category === filter);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2071)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>

          <div className="absolute inset-0 bg-[var(--navy)]/70" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Fully Customizable</h1>
          <div className="w-24 h-1 bg-[var(--orange)] mx-auto mb-4" />
          <p className="text-xl max-w-2xl mx-auto">Choose your favorite style and customize every detail

          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) =>
            <div
              key={index}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">

                <div className="relative h-80 overflow-hidden">
                  <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-[var(--orange)] text-white text-sm font-semibold rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--black)] mb-2">{product.name}</h3>
                  <p className="text-[var(--gray-medium)] mb-3">{product.description}</p>
                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, idx) =>
                  <div key={idx} className="flex items-center gap-2 text-sm text-[var(--gray-medium)]">
                        <Check className="w-4 h-4 text-[var(--orange)]" />
                        <span>{feature}</span>
                      </div>
                  )}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <span className="text-lg font-bold text-[var(--navy)]">{product.price}</span>
                    <Link to={createPageUrl("Contact")}>
                      <Button size="sm" className="bg-[var(--orange)] hover:bg-[var(--orange)]/90 text-white">
                        Get Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-16 bg-[var(--gray-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--black)] mb-4">
              Full Customization Available
            </h2>
            <div className="w-24 h-1 bg-[var(--orange)] mx-auto mb-6" />
            <p className="text-lg text-[var(--gray-medium)] max-w-3xl mx-auto">
              Every style can be fully customized with your choice of embroidery, patches, colors, and materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-[var(--orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--orange)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">Custom Embroidery</h3>
              <p className="text-[var(--gray-medium)]">
                Precision embroidery with unlimited font and color options
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-[var(--navy)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--navy)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">Patch Application</h3>
              <p className="text-[var(--gray-medium)]">
                Woven or embroidered patches in any design
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-[var(--orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--orange)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">Color Selection</h3>
              <p className="text-[var(--gray-medium)]">
                Wide range of fabric and mesh color combinations
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-[var(--navy)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--navy)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--black)] mb-3">Bulk Orders</h3>
              <p className="text-[var(--gray-medium)]">
                Competitive pricing for team and corporate orders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--black)] mb-6">
            Ready to Design Your Custom Caps?
          </h2>
          <div className="w-24 h-1 bg-[var(--orange)] mx-auto mb-6" />
          <p className="text-lg text-[var(--gray-medium)] mb-8">
            Contact us to discuss your custom baseball cap project. We'll work with you to create 
            exactly what you envision, from initial concept to final product.
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button size="lg" className="bg-[var(--navy)] text-slate-900 px-8 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 hover:bg-[var(--navy)]/90">
              Start Your Custom Order
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>);

}
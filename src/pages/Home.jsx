import React from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import PricingCalculator from "../components/home/PricingCalculator";
import Testimonials from "../components/home/Testimonials";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <PricingCalculator />
      {/*<Testimonials />*/}
    </div>
  );
}
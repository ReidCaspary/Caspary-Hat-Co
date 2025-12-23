import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
{
  name: "James Mitchell",
  location: "Houston, TX",
  text: "The custom embroidery on our team hats turned out perfect! Caspary Hat Co. nailed every detail and the quality is outstanding.",
  rating: 5,
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200"
},
{
  name: "Sarah Rodriguez",
  location: "Dallas, TX",
  text: "We ordered 50 custom trucker caps for our company event. The process was smooth and the hats exceeded our expectations!",
  rating: 5,
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200"
},
{
  name: "Robert Chen",
  location: "Austin, TX",
  text: "Amazing work on our custom patches and logo embroidery. They worked with us every step of the way. Highly recommend!",
  rating: 5,
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200"
}];


export default function Testimonials() {
  return (
    <section className="bg-gray-200 py-12 sm:py-16 lg:py-24 from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--primary)] mb-3 sm:mb-4 lg:mb-6">
            What Our Customers Say
          </h2>
          <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mx-auto mb-4 sm:mb-6 lg:mb-8" />
          <p className="text-sm sm:text-base lg:text-xl text-[var(--gray-medium)] max-w-3xl mx-auto px-4">
            See what our customers have to say about their custom baseball hat experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) =>
          <div
            key={index}
            className="relative bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">

              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-[var(--primary)]" />
              </div>
              
              <div className="relative">
                <div className="flex items-center mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) =>
                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--accent)] text-[var(--accent)]" />
                )}
                </div>
                
                <p className="text-[var(--gray-medium)] mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-3 sm:mr-4 ring-4 ring-[var(--accent)]/20" />

                  <div>
                    <p className="font-bold text-sm sm:text-base text-[var(--primary)]">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-[var(--gray-medium)]">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}
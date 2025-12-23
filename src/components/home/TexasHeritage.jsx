import React from "react";
import { ClipboardList, PenTool, FileCheck2, CreditCard, Truck, Smile } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Complete Quote Form",
    description: "Attach your logo, select your style, and submit your form (MOQ 144)."
  },
  {
    icon: PenTool,
    title: "Design Consultation",
    description: "A design pro will reach out to discuss mockups and design details."
  },
  {
    icon: FileCheck2,
    title: "Approve & Invoice",
    description: "Review your final design and approve the invoice to start production."
  },
  {
    icon: CreditCard,
    title: "50% Deposit",
    description: "Half is due upfront to begin your order — balance due before shipping."
  },
  {
    icon: Truck,
    title: "Production & Shipping",
    description: "4–6 weeks later, your hats are complete and shipped straight to you."
  },
  {
    icon: Smile,
    title: "Enjoy!",
    description: "Show off your new fully custom hats — built Texas tough, made just for you."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--primary)] mb-3 sm:mb-4 lg:mb-6">How It Works</h2>
        <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mx-auto mb-6 sm:mb-8 lg:mb-12" />
        <p className="text-sm sm:text-base lg:text-lg text-[var(--gray-medium)] max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-4">
          From first click to final stitch — here's how your custom Caspary Hat Co. order comes to life.
        </p>

        {/* Compact grid layout for mobile, horizontal flow for desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center"
            >
              {/* icon wrapper - smaller on mobile */}
              <div className="relative mb-3 sm:mb-4 lg:mb-6 flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>

                {/* connecting dotted line - only show on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-28 border-t-4 border-dotted border-[var(--accent)] translate-y-[-50%]" />
                )}
              </div>

              {/* text wrapper - more compact */}
              <div className="flex flex-col items-center">
                <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-[var(--primary)] mb-1 sm:mb-2 leading-tight">{step.title}</h3>
                <p className="text-[var(--gray-medium)] text-[10px] sm:text-xs lg:text-sm leading-snug max-w-[120px] sm:max-w-[140px] lg:max-w-[200px]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
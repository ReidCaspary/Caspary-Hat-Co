import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function PricingCalculator() {
  const [quantity, setQuantity] = useState(144);
  const [inputValue, setInputValue] = useState("144");
  const MIN_HATS = 144;
  const MAX_HATS = 1000; // changed to 1000 as requested

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // Pricing formula: anchors at 144 => $16, ~288 => ~$14, long-run -> $8 at 10,000
  // This produces a smooth logarithmic decay. We still use 10,000 as long-run anchor
  // so the curve shape matches your earlier requirements even with UI max = 1000.
  const calculatePricePerHat = (qtyInput) => {
    const qty = Math.max(MIN_HATS, qtyInput || MIN_HATS);
    const qMin = MIN_HATS;
    const qMaxAnchor = 1000; // long-run anchor to shape the curve
    const pMin = 10; // floor at $8 long-run
    const pMax = 12; // $12 at MOQ

    // normalized log position between qMin and qMaxAnchor (descending)
    const topLog = Math.log10(qMaxAnchor);
    const minLog = Math.log10(qMin);
    const curLog = Math.log10(Math.max(qMin, qty));
    const t = (topLog - curLog) / (topLog - minLog);

    // exponent to make the early drop a bit steeper (tunable)
    const exponent = 1.05;

    const price = pMin + (pMax - pMin) * Math.pow(t, exponent);
    // clamp between pMin and pMax just in case
    return Math.max(pMin, Math.min(pMax, price));
  };

  const pricePerHat = calculatePricePerHat(quantity);
  const totalPrice = quantity * pricePerHat;

  const handleSliderChange = (e) => {
    const val = Math.round(Number(e.target.value));
    setQuantity(val);
    setInputValue(val.toString());
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const commitQuantity = () => {
    let val = parseInt(inputValue, 10);
    if (isNaN(val)) val = MIN_HATS;
    if (val < MIN_HATS) val = MIN_HATS;
    if (val > MAX_HATS) val = MAX_HATS; // clamp to MAX_HATS
    setQuantity(val);
    setInputValue(val.toString());
  };

  const handleInputBlur = () => {
    commitQuantity();
  };

  const handleInputKeyDown = (e) => {
    // Arrow keys should update as the user presses them (immediate feedback)
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let val = parseInt(inputValue, 10);
      if (isNaN(val)) val = quantity || MIN_HATS;
      if (e.key === "ArrowUp") val = val + 1;
      if (e.key === "ArrowDown") val = val - 1;
      if (val < MIN_HATS) val = MIN_HATS;
      if (val > MAX_HATS) val = MAX_HATS;
      setQuantity(val);
      setInputValue(val.toString());
      return;
    }

    // Enter commits
    if (e.key === "Enter") {
      commitQuantity();
      e.currentTarget.blur();
    }
  };

  const sliderValue = Math.min(quantity, MAX_HATS);
  const percent = ((sliderValue - MIN_HATS) / (MAX_HATS - MIN_HATS)) * 100;

  return (
    <section className="bg-gray-200 py-12 sm:py-16 lg:py-24 from-gray-50 to-white relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* How It Works Section */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--primary)] mb-3 sm:mb-4 lg:mb-6">
              How It Works
            </h2>
            <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mx-auto mb-6 sm:mb-8 lg:mb-12" />
            <p className="text-sm sm:text-base lg:text-lg text-[var(--gray-medium)] max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-4">
              From first click to final stitch — here's how your Custom Caspary Hat order comes to life.
            </p>

           {/* Compact Steps Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: "📋", title: "Complete Quote Form", description: "Attach your logo, select your style, and submit your form (MOQ 144)." },
                { icon: "✏️", title: "Design Consultation", description: "A design pro will reach out to discuss mockups and design details." },
                { icon: "✅", title: "Approve & Invoice", description: "Review your final design and approve the invoice to start production." },
                { icon: "💳", title: "50% Deposit", description: "Half is due upfront to begin your order — balance due before shipping." },
                { icon: "🚚", title: "Production & Shipping", description: "4–6 weeks later, your hats are complete and shipped straight to you." },
                { icon: "🧢", title: "Enjoy!", description: "Show off your new fully custom hats — made just for you." }
              ].map((step, index) => (
                <div key={index} className="relative flex flex-col items-center text-center">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{step.icon}</div>
                  <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-[var(--primary)] mb-1 sm:mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[var(--gray-medium)] text-[10px] sm:text-xs lg:text-sm leading-snug max-w-[120px] sm:max-w-[140px] lg:max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Pricing Section */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[var(--primary)] mb-3 sm:mb-4 lg:mb-6">
              Pricing
            </h2>
            <div className="w-20 sm:w-24 lg:w-32 h-1.5 lg:h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full mx-auto mb-6 sm:mb-8 lg:mb-12" />
            <p className="text-sm sm:text-base lg:text-lg text-[var(--gray-medium)] max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
              Slide to see your price per hat
            </p>

            {/* Pricing Calculator Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 max-w-lg mx-auto">
              {/* Quantity Slider */}
              <div className="mb-8">
                <label className="block text-lg sm:text-xl font-bold text-[var(--primary)] mb-4">
                  Order Quantity:&nbsp;
                  <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    className="inline-block w-32 text-center text-[var(--accent)] bg-white border border-[var(--primary)] rounded-md px-2 py-1 focus:outline-none focus:border-[var(--accent)]"
                    min={MIN_HATS}
                    max={MAX_HATS}
                  />
                </label>

                <div className="relative">
                  <input
                    type="range"
                    min={MIN_HATS}
                    max={MAX_HATS}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full h-3 bg-[var(--primary)]/20 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, rgba(23,44,99,0.12) ${percent}%, rgba(23,44,99,0.12) 100%)`
                    }}
                  />
                  <style jsx>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: var(--accent);
                      cursor: pointer;
                      box-shadow: 0 2px 8px rgba(209, 143, 99, 0.4);
                      border: 3px solid white;
                    }
                    .slider::-moz-range-thumb {
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: var(--accent);
                      cursor: pointer;
                      box-shadow: 0 2px 8px rgba(209, 143, 99, 0.4);
                      border: 3px solid white;
                    }
                  `}</style>
                </div>

                <div className="flex justify-between mt-2 text-xs text-[var(--gray-medium)]">
                  <span>MOQ {MIN_HATS}</span>
                  <span>{MAX_HATS}+</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-4 mb-8 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg text-[var(--gray-medium)]">Price per Hat:</span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--accent)]">
                    ${pricePerHat.toFixed(2)}
                  </span>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />

                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg text-[var(--gray-medium)]">Total Price:</span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--primary)]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Note for large orders */}
              {quantity >= MAX_HATS && (
                <p className="text-sm text-[var(--accent)] mb-4 font-semibold">
                  Contact us for larger orders and special pricing!
                </p>
              )}

              {/* Get Quote Button */}
              <Link to={`${createPageUrl("Contact")}?quantity=${quantity}`}>
                <Button
                  size="lg"
                  className="w-full bg-[var(--primary)] hover:bg-[var(--accent)] text-white font-bold py-4 sm:py-5 text-base sm:text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <DollarSign className="mr-2 w-5 h-5" />
                  Get Custom Quote
                </Button>
              </Link>

              <p className="text-xs text-[var(--gray-medium)] mt-4">
                *Final pricing may vary based on customization complexity, materials, and design details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
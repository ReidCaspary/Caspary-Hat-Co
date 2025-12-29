import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { PricingConfig } from "@/api/apiClient";

// Default values (will be overridden by API config)
const DEFAULT_MIN_HATS = 50;
const DEFAULT_MAX_HATS = 1000;

export default function PricingCalculator() {
  const [quantity, setQuantity] = useState(DEFAULT_MIN_HATS);
  const [inputValue, setInputValue] = useState(DEFAULT_MIN_HATS.toString());
  const [pricingConfig, setPricingConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch pricing config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await PricingConfig.getConfig();
        setPricingConfig(config);
        // Set initial quantity to MOQ
        const moq = config?.settings?.min_order_quantity || DEFAULT_MIN_HATS;
        setQuantity(moq);
        setInputValue(moq.toString());
      } catch (error) {
        console.error('Failed to fetch pricing config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // Get config values with defaults
  const MIN_HATS = pricingConfig?.settings?.min_order_quantity || DEFAULT_MIN_HATS;
  const MAX_HATS = pricingConfig?.settings?.max_ui_quantity || DEFAULT_MAX_HATS;
  const tiers = pricingConfig?.tiers || [];
  const variableConfig = pricingConfig?.settings?.variable || {
    max_price: 11.00,
    min_price: 10.00,
    anchor_quantity: 5000,
    exponent: 1.05
  };

  // Calculate price per hat using tiers or variable formula
  const calculatePricePerHat = (qtyInput) => {
    const qty = Math.max(MIN_HATS, qtyInput || MIN_HATS);

    // First, check if quantity falls within a tier
    for (const tier of tiers) {
      if (qty >= tier.min_quantity && qty <= tier.max_quantity) {
        return tier.price_per_hat;
      }
    }

    // If no tier matches (quantity > all tiers), use variable pricing formula
    const lastTier = tiers.length > 0 ? tiers[tiers.length - 1] : null;
    const thresholdQty = lastTier ? lastTier.max_quantity : MIN_HATS;

    const { max_price, min_price, anchor_quantity, exponent } = variableConfig;

    // If below threshold, use max price
    if (qty <= thresholdQty) {
      return max_price;
    }

    // Variable formula for quantities beyond tiers
    const topLog = Math.log10(anchor_quantity);
    const minLog = Math.log10(thresholdQty);
    const curLog = Math.log10(Math.max(thresholdQty, qty));
    const t = (topLog - curLog) / (topLog - minLog);

    const price = min_price + (max_price - min_price) * Math.pow(t, exponent);
    return Math.max(min_price, Math.min(max_price, price));
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
                { icon: "📋", title: "Complete Quote Form", description: `Attach your logo, select your style, and submit your form (MOQ ${MIN_HATS}).` },
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
              {/* Pricing Tiers Summary */}
              {tiers.length > 0 && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-[var(--primary)] mb-2">Volume Pricing:</p>
                  <div className="space-y-1 text-xs text-[var(--gray-medium)]">
                    {tiers.map((tier, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{tier.min_quantity} - {tier.max_quantity} hats</span>
                        <span className="font-medium text-[var(--primary)]">${tier.price_per_hat.toFixed(2)}/hat</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span>{tiers[tiers.length - 1].max_quantity}+ hats</span>
                      <span className="font-medium text-[var(--primary)]">${variableConfig.max_price.toFixed(2)} - ${variableConfig.min_price.toFixed(2)}/hat</span>
                    </div>
                  </div>
                </div>
              )}

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
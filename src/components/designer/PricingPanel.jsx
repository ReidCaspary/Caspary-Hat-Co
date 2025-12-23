import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { DollarSign, Package, TrendingDown } from "lucide-react";

const MIN_HATS = 144;
const MAX_HATS = 1000;

// Pricing formula from PricingCalculator
const calculatePricePerHat = (qtyInput) => {
  const qty = Math.max(MIN_HATS, qtyInput || MIN_HATS);
  const qMin = MIN_HATS;
  const qMaxAnchor = 1000;
  const pMin = 10;
  const pMax = 12;

  const topLog = Math.log10(qMaxAnchor);
  const minLog = Math.log10(qMin);
  const curLog = Math.log10(Math.max(qMin, qty));
  const t = (topLog - curLog) / (topLog - minLog);

  const exponent = 1.05;
  const price = pMin + (pMax - pMin) * Math.pow(t, exponent);
  return Math.max(pMin, Math.min(pMax, price));
};

export default function PricingPanel({ quantity, onQuantityChange }) {
  const [inputValue, setInputValue] = useState(quantity.toString());

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const pricePerHat = calculatePricePerHat(quantity);
  const totalPrice = quantity * pricePerHat;

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const commitQuantity = () => {
    let val = parseInt(inputValue, 10);
    if (isNaN(val)) val = MIN_HATS;
    if (val < MIN_HATS) val = MIN_HATS;
    if (val > MAX_HATS) val = MAX_HATS;
    onQuantityChange(val);
    setInputValue(val.toString());
  };

  const handleInputBlur = () => {
    commitQuantity();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      let val = parseInt(inputValue, 10);
      if (isNaN(val)) val = quantity || MIN_HATS;
      if (e.key === "ArrowUp") val = val + 1;
      if (e.key === "ArrowDown") val = val - 1;
      if (val < MIN_HATS) val = MIN_HATS;
      if (val > MAX_HATS) val = MAX_HATS;
      onQuantityChange(val);
      setInputValue(val.toString());
      return;
    }
    if (e.key === "Enter") {
      commitQuantity();
      e.currentTarget.blur();
    }
  };

  const handleSliderChange = (e) => {
    const val = Math.round(Number(e.target.value));
    onQuantityChange(val);
    setInputValue(val.toString());
  };

  const sliderValue = Math.min(quantity, MAX_HATS);
  const percent = ((sliderValue - MIN_HATS) / (MAX_HATS - MIN_HATS)) * 100;

  // Calculate savings compared to minimum order
  const basePrice = calculatePricePerHat(MIN_HATS);
  const savings = quantity > MIN_HATS ? (basePrice - pricePerHat) * quantity : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-[var(--accent)]" />
        Pricing Estimate
      </h2>

      {/* Quantity Input */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-medium text-gray-700">
            Order Quantity
          </Label>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-24 text-center font-bold text-[var(--accent)] bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-[var(--accent)]"
            min={MIN_HATS}
            max={MAX_HATS}
          />
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={MIN_HATS}
            max={MAX_HATS}
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`,
            }}
          />
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: var(--accent);
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(209, 143, 99, 0.4);
              border: 2px solid white;
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: var(--accent);
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(209, 143, 99, 0.4);
              border: 2px solid white;
            }
          `}</style>
        </div>

        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>MOQ {MIN_HATS}</span>
          <span>{MAX_HATS}+</span>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Per Hat
          </span>
          <span className="text-xl font-bold text-[var(--accent)]">
            ${pricePerHat.toFixed(2)}
          </span>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-2xl font-black text-[var(--primary)]">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        {savings > 0 && (
          <>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center text-green-600">
              <span className="text-xs flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Volume Savings
              </span>
              <span className="text-sm font-semibold">
                -${savings.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Large order note */}
      {quantity >= MAX_HATS && (
        <p className="text-xs text-[var(--accent)] font-medium text-center">
          Contact us for larger orders and special pricing!
        </p>
      )}

      {/* Pricing disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        *Estimate only. Final price may vary based on design complexity.
      </p>
    </div>
  );
}

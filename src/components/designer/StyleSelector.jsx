import React from "react";
import { Check } from "lucide-react";

const HAT_STYLES = [
  {
    id: "classic",
    name: "The Classic",
    description: "Classic Trucker Hat with Mesh Back. Available in 5 or 6 Panels.",
    category: "Mesh Back",
    // Placeholder - user will provide actual mockup images
    image: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg",
  },
  {
    id: "caddie",
    name: "The Caddie",
    description: "Classic Rope Hat with Mesh or Fabric Back. Perfect for a vintage look.",
    category: "Rope Hat",
    // Placeholder - user will provide actual mockup images
    image: "https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg",
  },
];

export default function StyleSelector({ selectedStyle, onSelectStyle }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Choose Your Style</h2>
        <p className="text-sm text-gray-500">Select the hat style you want to customize</p>
      </div>

      <div className="space-y-3">
        {HAT_STYLES.map((style) => (
          <div
            key={style.id}
            onClick={() => onSelectStyle(style.id)}
            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
              selectedStyle === style.id
                ? "border-[var(--accent)] shadow-lg ring-2 ring-[var(--accent)]/20"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            {/* Selection Indicator */}
            {selectedStyle === style.id && (
              <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Image */}
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img
                src={style.image}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900">{style.name}</h3>
                <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-full">
                  {style.category}
                </span>
              </div>
              <p className="text-sm text-gray-500">{style.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* More styles coming soon */}
      <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-sm text-gray-400">More styles coming soon!</p>
      </div>
    </div>
  );
}

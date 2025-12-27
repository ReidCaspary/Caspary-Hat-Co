import React from "react";
import { Check } from "lucide-react";

export default function StyleSelector({ selectedStyle, hatTypes, onSelectStyle }) {
  // Convert hatTypes object to array for rendering
  const hatStyles = Object.values(hatTypes || {});

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Choose Your Style</h2>
        <p className="text-sm text-gray-500">Select the hat style you want to customize</p>
      </div>

      <div className="space-y-3">
        {hatStyles.map((style) => (
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
                src={style.previewImage}
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

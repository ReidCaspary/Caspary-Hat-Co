import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

export default function ColorPicker({ colors, hatStyle, hatTypes, colorPresets, colorCombinations, onColorChange }) {
  const [activeColorPart, setActiveColorPart] = useState("front");

  // Get parts from hat type config (passed from parent)
  const hatTypeConfig = hatTypes?.[hatStyle] || Object.values(hatTypes || {})[0] || { parts: [] };
  const parts = hatTypeConfig.parts || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[var(--accent)]" />
          Customize Colors
        </h2>
        <p className="text-sm text-gray-500">
          Choose colors for each part of your hat
        </p>
      </div>

      {/* Part Selector */}
      <div className="space-y-2">
        {parts.map((part) => (
          <div
            key={part.id}
            onClick={() => setActiveColorPart(part.id)}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border-2 transition-all ${
              activeColorPart === part.id
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div>
              <p className="font-medium text-gray-900">{part.name}</p>
              <p className="text-xs text-gray-500">{part.description}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner"
              style={{ backgroundColor: colors[part.id] }}
            />
          </div>
        ))}
      </div>

      {/* Color Presets */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Color
        </Label>
        <div className="grid grid-cols-6 gap-2">
          {(colorPresets || []).map((color) => (
            <button
              key={color.hex}
              onClick={() => onColorChange(activeColorPart, color.hex)}
              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                colors[activeColorPart] === color.hex
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Popular Combinations */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Popular Combinations
        </Label>
        <div className="space-y-2">
          {(colorCombinations || []).map((combo) => (
            <button
              key={combo.name}
              onClick={() => {
                onColorChange("front", combo.front);
                onColorChange("mesh", combo.mesh);
                onColorChange("brim", combo.brim);
                if (combo.rope) {
                  onColorChange("rope", combo.rope);
                }
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <div className="flex -space-x-1">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: combo.front }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: combo.mesh }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: combo.brim }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{combo.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

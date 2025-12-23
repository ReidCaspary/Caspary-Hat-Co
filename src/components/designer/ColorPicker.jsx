import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

const PRESET_COLORS = [
  { name: "Navy", hex: "#172c63" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Red", hex: "#dc2626" },
  { name: "Orange", hex: "#d18f63" },
  { name: "Green", hex: "#16a34a" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Tan", hex: "#d4a574" },
  { name: "Camo Green", hex: "#4a5c3a" },
  { name: "Pink", hex: "#ec4899" },
];

const COLOR_PARTS = {
  classic: [
    { id: "front", name: "Front Panel", description: "The front fabric panels" },
    { id: "back", name: "Back Mesh", description: "The mesh back panels" },
    { id: "brim", name: "Brim", description: "The hat brim/bill" },
  ],
  caddie: [
    { id: "front", name: "Front Panel", description: "The front fabric" },
    { id: "back", name: "Back Panel", description: "The back fabric" },
    { id: "brim", name: "Brim", description: "The hat brim/bill" },
  ],
};

export default function ColorPicker({ colors, hatStyle, onColorChange }) {
  const [activeColorPart, setActiveColorPart] = useState("front");

  const parts = COLOR_PARTS[hatStyle] || COLOR_PARTS.classic;

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
          Quick Colors
        </Label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
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

      {/* Custom Color Input */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Custom Color
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={colors[activeColorPart]}
              onChange={(e) => onColorChange(activeColorPart, e.target.value)}
              placeholder="#000000"
              className="pl-12 font-mono"
            />
            <input
              type="color"
              value={colors[activeColorPart]}
              onChange={(e) => onColorChange(activeColorPart, e.target.value)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded cursor-pointer border-0"
            />
          </div>
        </div>
      </div>

      {/* Popular Combinations */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Popular Combinations
        </Label>
        <div className="space-y-2">
          {[
            { name: "Classic Navy", front: "#172c63", back: "#ffffff", brim: "#172c63" },
            { name: "All Black", front: "#000000", back: "#000000", brim: "#000000" },
            { name: "Texas Orange", front: "#d18f63", back: "#ffffff", brim: "#d18f63" },
            { name: "Camo", front: "#4a5c3a", back: "#4a5c3a", brim: "#4a5c3a" },
          ].map((combo) => (
            <button
              key={combo.name}
              onClick={() => {
                onColorChange("front", combo.front);
                onColorChange("back", combo.back);
                onColorChange("brim", combo.brim);
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
                  style={{ backgroundColor: combo.back }}
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

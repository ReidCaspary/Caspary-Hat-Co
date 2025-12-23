import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const FONTS = [
  { name: "Arial", value: "Arial" },
  { name: "Impact", value: "Impact" },
  { name: "Georgia", value: "Georgia" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Courier New", value: "Courier New" },
  { name: "Verdana", value: "Verdana" },
  { name: "Trebuchet MS", value: "Trebuchet MS" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
];

const TEXT_COLORS = [
  "#ffffff",
  "#000000",
  "#172c63",
  "#d18f63",
  "#dc2626",
  "#16a34a",
  "#2563eb",
  "#f59e0b",
];

export default function TextEditor({
  onAddText,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) {
  const [text, setText] = useState("");
  const [font, setFont] = useState("Arial");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(32);

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setText(selectedElement.content || "");
      setFont(selectedElement.font || "Arial");
      setColor(selectedElement.color || "#ffffff");
      setSize(selectedElement.size || 32);
    }
  }, [selectedElement]);

  const handleAddText = () => {
    if (!text.trim()) return;

    onAddText({
      type: "text",
      content: text,
      font,
      color,
      size,
      x: 200, // Center of design area
      y: 120,
    });

    setText("");
  };

  const handleUpdate = (updates) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900">
        {selectedElement ? "Edit Text" : "Add Text"}
      </h3>

      {/* Text Input */}
      <div>
        <Label className="text-sm text-gray-600">Text Content</Label>
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (selectedElement) {
              handleUpdate({ content: e.target.value });
            }
          }}
          placeholder="Enter your text..."
          className="mt-1"
        />
      </div>

      {/* Font Selection */}
      <div>
        <Label className="text-sm text-gray-600">Font</Label>
        <Select
          value={font}
          onValueChange={(value) => {
            setFont(value);
            if (selectedElement) {
              handleUpdate({ font: value });
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm text-gray-600">Size</Label>
          <span className="text-sm font-medium text-gray-900">{size}px</span>
        </div>
        <Slider
          value={[size]}
          min={12}
          max={72}
          step={2}
          onValueChange={([value]) => {
            setSize(value);
            if (selectedElement) {
              handleUpdate({ size: value });
            }
          }}
        />
      </div>

      {/* Color Selection */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (selectedElement) {
                  handleUpdate({ color: c });
                }
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              if (selectedElement) {
                handleUpdate({ color: e.target.value });
              }
            }}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {selectedElement ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        ) : (
          <Button
            onClick={handleAddText}
            disabled={!text.trim()}
            className="flex-1 bg-[var(--accent)] hover:bg-[var(--primary)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        )}
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-500 text-center">
        {selectedElement
          ? "Drag text on canvas to reposition"
          : "Click 'Add Text' to place on hat"}
      </p>
    </div>
  );
}

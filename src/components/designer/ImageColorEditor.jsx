import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw, Check, Eraser } from "lucide-react";

export default function ImageColorEditor({ imageUrl, onComplete, onCancel }) {
  const canvasRef = useRef(null);
  const workingCanvasRef = useRef(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [replacementColor, setReplacementColor] = useState("#000000");
  const [colorReplacements, setColorReplacements] = useState({});
  const [bgColorToRemove, setBgColorToRemove] = useState(null);
  const [bgTolerance, setBgTolerance] = useState(30);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImgDimensions({ width: img.width, height: img.height });

      // Create working canvas to store original image data
      const workingCanvas = document.createElement("canvas");
      workingCanvas.width = img.width;
      workingCanvas.height = img.height;
      const workingCtx = workingCanvas.getContext("2d");
      workingCtx.drawImage(img, 0, 0);
      workingCanvasRef.current = workingCanvas;

      // Store original image data
      const imageData = workingCtx.getImageData(0, 0, img.width, img.height);
      setOriginalImageData(imageData);

      // Extract colors
      extractColors(imageData);
      setLoading(false);
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageUrl);
      setLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Apply effects whenever settings change
  useEffect(() => {
    if (originalImageData) {
      applyEffects();
    }
  }, [filters, colorReplacements, bgColorToRemove, bgTolerance, originalImageData]);

  const extractColors = (imageData) => {
    const colorCounts = {};
    const data = imageData.data;

    // Sample pixels to extract unique colors
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Quantize colors to reduce similar colors
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;

      const colorKey = `${qr},${qg},${qb}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    // Sort by frequency and take top colors
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([color]) => {
        const [r, g, b] = color.split(",").map(Number);
        return { hex: rgbToHex(r, g, b), r, g, b };
      });

    setExtractedColors(sortedColors);
  };

  const applyEffects = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImageData) return;

    const ctx = canvas.getContext("2d");
    canvas.width = imgDimensions.width;
    canvas.height = imgDimensions.height;

    // Create a copy of the original image data to work with
    const newImageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );
    const data = newImageData.data;

    // Apply color replacements and background removal
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Background removal - make matching colors transparent
      if (bgColorToRemove) {
        const distance = Math.sqrt(
          Math.pow(r - bgColorToRemove.r, 2) +
          Math.pow(g - bgColorToRemove.g, 2) +
          Math.pow(b - bgColorToRemove.b, 2)
        );
        if (distance <= bgTolerance) {
          data[i + 3] = 0; // Make transparent
          continue;
        }
      }

      // Color replacements
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      const originalHex = rgbToHex(qr, qg, qb);

      if (colorReplacements[originalHex]) {
        const newColor = hexToRgb(colorReplacements[originalHex]);
        if (newColor) {
          data[i] = newColor.r;
          data[i + 1] = newColor.g;
          data[i + 2] = newColor.b;
        }
      }
    }

    // Put the processed image data
    ctx.putImageData(newImageData, 0, 0);

    // Apply CSS filters by drawing to a temp canvas
    if (filters.brightness !== 100 || filters.contrast !== 100 ||
        filters.saturation !== 100 || filters.hue !== 0) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg)`;
      tempCtx.drawImage(canvas, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }, [filters, colorReplacements, bgColorToRemove, bgTolerance, originalImageData, imgDimensions]);

  const handleColorSelect = (color) => {
    setSelectedColor(color.hex);
    setReplacementColor(colorReplacements[color.hex] || color.hex);
  };

  const handleReplacementChange = (e) => {
    const newColor = e.target.value;
    setReplacementColor(newColor);
    if (selectedColor) {
      setColorReplacements((prev) => ({
        ...prev,
        [selectedColor]: newColor,
      }));
    }
  };

  const handleRemoveBackground = (color) => {
    if (bgColorToRemove && bgColorToRemove.hex === color.hex) {
      // Toggle off if clicking the same color
      setBgColorToRemove(null);
    } else {
      setBgColorToRemove(color);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
    });
    setColorReplacements({});
    setSelectedColor(null);
    setBgColorToRemove(null);
    setBgTolerance(30);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png");
    onComplete(dataUrl);
  };

  // Helper functions
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.min(255, Math.max(0, x)).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-600">Loading image editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Edit Image</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Preview */}
      <div className="bg-gray-200 p-2 rounded-lg flex justify-center overflow-hidden" style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAcdEVYdFRpdGxlAENoZWNrZXJib2FyZCBwYXR0ZXJuX0Gr/AAAABl0RVh0QXV0aG9yAE9wZW5DbGlwQXJ0IExpYnJhcnmcoAjmAAAAN0lEQVQ4jWNgGAWjYBSMgsEOGBkZ/zMwMDD8J0YzIyMjiM34nxjNjIyMIIaRkZFBNBr4wSgAAMzrB/V3E0CJAAAAAElFTkSuQmCC")', backgroundRepeat: 'repeat' }}>
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-40 object-contain"
        />
      </div>

      {/* Background Removal */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">
          <Eraser className="w-4 h-4 inline mr-1" />
          Remove Background (click a color below)
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {extractedColors.map((color, index) => (
            <button
              key={`bg-${index}`}
              onClick={() => handleRemoveBackground(color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                bgColorToRemove?.hex === color.hex
                  ? "border-red-500 ring-2 ring-red-300"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: color.hex }}
              title={`Remove ${color.hex}`}
            />
          ))}
        </div>
        {bgColorToRemove && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Removing:</span>
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: bgColorToRemove.hex }}
              />
              <span>{bgColorToRemove.hex}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tolerance</span>
                <span>{bgTolerance}</span>
              </div>
              <Slider
                value={[bgTolerance]}
                min={5}
                max={100}
                step={5}
                onValueChange={([value]) => setBgTolerance(value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Color Replacement */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">
          Replace Colors (click to select, then pick new color)
        </Label>
        <div className="flex flex-wrap gap-2">
          {extractedColors.map((color, index) => (
            <button
              key={`color-${index}`}
              onClick={() => handleColorSelect(color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                selectedColor === color.hex
                  ? "border-blue-500 scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: colorReplacements[color.hex] || color.hex }}
              title={color.hex}
            />
          ))}
        </div>
        {selectedColor && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded mt-2">
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm">→</span>
            <input
              type="color"
              value={replacementColor}
              onChange={handleReplacementChange}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <span className="text-xs text-gray-500">{replacementColor}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Label className="text-sm text-gray-600">Filters</Label>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Brightness</span>
            <span>{filters.brightness}%</span>
          </div>
          <Slider
            value={[filters.brightness]}
            min={0}
            max={200}
            step={5}
            onValueChange={([value]) => handleFilterChange("brightness", value)}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Contrast</span>
            <span>{filters.contrast}%</span>
          </div>
          <Slider
            value={[filters.contrast]}
            min={0}
            max={200}
            step={5}
            onValueChange={([value]) => handleFilterChange("contrast", value)}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Saturation</span>
            <span>{filters.saturation}%</span>
          </div>
          <Slider
            value={[filters.saturation]}
            min={0}
            max={200}
            step={5}
            onValueChange={([value]) => handleFilterChange("saturation", value)}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Hue Rotate</span>
            <span>{filters.hue}°</span>
          </div>
          <Slider
            value={[filters.hue]}
            min={0}
            max={360}
            step={5}
            onValueChange={([value]) => handleFilterChange("hue", value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1">
          <Check className="w-4 h-4 mr-1" />
          Apply
        </Button>
      </div>
    </div>
  );
}

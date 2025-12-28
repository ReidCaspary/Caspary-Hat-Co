import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { MARKER_COLORS } from "@/config/hatConfig";

// Default canvas config fallback
const DEFAULT_CANVAS_CONFIG = {
  width: 400,
  height: 300,
  designArea: {
    front: { x: 100, y: 60, width: 200, height: 120 },
    back: { x: 100, y: 80, width: 200, height: 100 },
  },
};

// Helper: Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

// Helper: Calculate color distance
const colorDistance = (r1, g1, b1, r2, g2, b2) => {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

// Helper: Replace marker colors in image data with user colors
// Higher tolerance = more lenient color matching (captures shadows/variations)
const replaceMarkerColors = (sourceImageData, userColors, markerColors, tolerance = 80) => {
  const data = new Uint8ClampedArray(sourceImageData.data);

  // Use provided marker colors, fall back to defaults if not set
  const effectiveMarkers = {
    front: markerColors?.front || MARKER_COLORS.front,
    mesh: markerColors?.mesh || MARKER_COLORS.mesh,
    brim: markerColors?.brim || MARKER_COLORS.brim,
    rope: markerColors?.rope || MARKER_COLORS.rope,
  };

  // Convert marker hex colors to RGB
  const markerRgb = {};
  for (const [part, hex] of Object.entries(effectiveMarkers)) {
    if (hex) {
      markerRgb[part] = hexToRgb(hex);
    }
  }

  // Convert user colors to RGB
  const userRgb = {};
  for (const [part, hex] of Object.entries(userColors)) {
    if (hex) {
      userRgb[part] = hexToRgb(hex);
    }
  }

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 10) continue;

    // Check each marker color
    for (const [part, marker] of Object.entries(markerRgb)) {
      if (!marker) continue;
      const userColor = userRgb[part];
      if (!userColor) continue;

      const distance = colorDistance(r, g, b, marker.r, marker.g, marker.b);

      if (distance < tolerance) {
        // Calculate luminance factor to preserve shading
        const markerMax = Math.max(marker.r, marker.g, marker.b);
        const pixelMax = Math.max(r, g, b);
        const luminance = markerMax > 0 ? pixelMax / markerMax : 1;

        // Apply user color with luminance preservation
        data[i] = Math.min(255, Math.round(userColor.r * luminance));
        data[i + 1] = Math.min(255, Math.round(userColor.g * luminance));
        data[i + 2] = Math.min(255, Math.round(userColor.b * luminance));
        break;
      }
    }
  }

  return new ImageData(data, sourceImageData.width, sourceImageData.height);
};

const DesignCanvas = forwardRef(function DesignCanvas(
  { design, hatTypes, selectedElementId, onSelectElement, onUpdateElement, onViewChange },
  ref
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState({}); // { elementId: { img, url } }
  const [hatImageData, setHatImageData] = useState({}); // { "classic-front": { imageData, width, height, url } }

  // Get hat type config from passed hatTypes prop
  const firstHatType = Object.values(hatTypes || {})[0];
  const hatTypeConfig = hatTypes?.[design.hatStyle] || firstHatType || {};
  const canvasConfig = hatTypeConfig.canvas || DEFAULT_CANVAS_CONFIG;
  const designArea = canvasConfig.designArea?.[design.currentView] || DEFAULT_CANVAS_CONFIG.designArea[design.currentView];

  // Load images for image elements - reload when URL changes
  useEffect(() => {
    design.elements.forEach((element) => {
      if (element.type === "image" && element.url) {
        const cached = loadedImages[element.id];
        // Load if not cached or if URL has changed
        if (!cached || cached.url !== element.url) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            setLoadedImages((prev) => ({
              ...prev,
              [element.id]: { img, url: element.url }
            }));
          };
          img.src = element.url;
        }
      }
    });
  }, [design.elements]);

  // Get current hat config for image URLs
  const currentHatConfig = hatTypes?.[design.hatStyle];
  const frontImageUrl = currentHatConfig?.images?.front;
  const backImageUrl = currentHatConfig?.images?.back;

  // Load hat images and extract pixel data for color replacement
  useEffect(() => {
    if (!design.hatStyle || !hatTypes) return;

    const hatConfig = hatTypes[design.hatStyle];
    if (!hatConfig?.images) return;

    // Load front and back images for this hat type
    ["front", "back"].forEach((view) => {
      const imageKey = `${design.hatStyle}-${view}`;
      const imagePath = hatConfig.images[view];

      // Check if we need to load/reload (new URL or not loaded yet)
      const currentData = hatImageData[imageKey];
      if (imagePath && (!currentData || currentData.url !== imagePath)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // Create a temporary canvas to extract image data
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext("2d");
          tempCtx.drawImage(img, 0, 0);

          // Extract the image data for pixel manipulation
          const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

          setHatImageData((prev) => ({
            ...prev,
            [imageKey]: {
              imageData,
              width: img.width,
              height: img.height,
              url: imagePath
            }
          }));
        };
        img.onerror = () => {
          console.warn(`Hat image not found: ${imagePath}`);
        };
        img.src = imagePath;
      }
    });
  }, [design.hatStyle, frontImageUrl, backImageUrl]);

  // Expose export function
  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        return canvas.toDataURL("image/png");
      }
      return null;
    },
  }));

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get hat image data for current view
    const hatImageKey = `${design.hatStyle}-${design.currentView}`;
    const hatData = hatImageData[hatImageKey];

    if (hatData?.imageData) {
      // Get marker colors for this hat type (from config)
      const hatConfig = hatTypes?.[design.hatStyle];
      const markerColors = hatConfig?.markerColors;

      // Apply color replacement to the hat image
      const processedImageData = replaceMarkerColors(hatData.imageData, design.colors, markerColors);

      // Create a temporary canvas to hold the processed image
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = hatData.width;
      tempCanvas.height = hatData.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.putImageData(processedImageData, 0, 0);

      // Draw the processed hat image scaled to fit the canvas
      ctx.drawImage(tempCanvas, 0, 0, canvasConfig.width, canvasConfig.height);
    } else {
      // Fallback: draw a placeholder if no image loaded
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading hat image...", canvasConfig.width / 2, canvasConfig.height / 2);
    }

    // Draw design area boundary (subtle guide)
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(designArea.x, designArea.y, designArea.width, designArea.height);
    ctx.setLineDash([]);

    // Draw elements for current view
    const viewElements = design.elements.filter(
      (el) => el.placement === design.currentView
    );

    viewElements.forEach((element) => {
      const isSelected = element.id === selectedElementId;

      if (element.type === "text") {
        drawTextElement(ctx, element, isSelected);
      } else if (element.type === "image" && loadedImages[element.id]?.img) {
        drawImageElement(ctx, element, loadedImages[element.id].img, isSelected);
      }
    });
  }, [design, selectedElementId, loadedImages, canvasConfig, designArea, hatImageData]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const drawTextElement = (ctx, element, isSelected) => {
    ctx.font = `${element.size || 32}px ${element.font || "Arial"}`;
    ctx.fillStyle = element.color || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(element.content, element.x, element.y);

    if (isSelected) {
      const metrics = ctx.measureText(element.content);
      const height = element.size || 32;
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        element.x - metrics.width / 2 - 5,
        element.y - height / 2 - 5,
        metrics.width + 10,
        height + 10
      );

      // Draw drag handle
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(element.x - metrics.width / 2 - 8, element.y - height / 2 - 8, 6, 6);
    }
  };

  const drawImageElement = (ctx, element, img, isSelected) => {
    const width = element.width || 100;
    const height = element.height || 100;
    ctx.drawImage(
      img,
      element.x - width / 2,
      element.y - height / 2,
      width,
      height
    );

    if (isSelected) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        element.x - width / 2 - 3,
        element.y - height / 2 - 3,
        width + 6,
        height + 6
      );

      // Draw resize handles
      const handleSize = 8;
      const corners = [
        { x: element.x - width / 2, y: element.y - height / 2 },
        { x: element.x + width / 2, y: element.y - height / 2 },
        { x: element.x - width / 2, y: element.y + height / 2 },
        { x: element.x + width / 2, y: element.y + height / 2 },
      ];
      ctx.fillStyle = "#3b82f6";
      corners.forEach((corner) => {
        ctx.fillRect(
          corner.x - handleSize / 2,
          corner.y - handleSize / 2,
          handleSize,
          handleSize
        );
      });
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const findElementAtPosition = (x, y) => {
    const viewElements = design.elements.filter(
      (el) => el.placement === design.currentView
    );

    // Check in reverse order (top elements first)
    for (let i = viewElements.length - 1; i >= 0; i--) {
      const el = viewElements[i];
      if (el.type === "text") {
        const size = el.size || 32;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.font = `${size}px ${el.font || "Arial"}`;
        const metrics = ctx.measureText(el.content);
        if (
          x >= el.x - metrics.width / 2 - 5 &&
          x <= el.x + metrics.width / 2 + 5 &&
          y >= el.y - size / 2 - 5 &&
          y <= el.y + size / 2 + 5
        ) {
          return el;
        }
      } else if (el.type === "image") {
        const w = el.width || 100;
        const h = el.height || 100;
        if (
          x >= el.x - w / 2 &&
          x <= el.x + w / 2 &&
          y >= el.y - h / 2 &&
          y <= el.y + h / 2
        ) {
          return el;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    const element = findElementAtPosition(pos.x, pos.y);

    if (element) {
      onSelectElement(element.id);
      setIsDragging(true);
      setDragOffset({
        x: pos.x - element.x,
        y: pos.y - element.y,
      });
    } else {
      onSelectElement(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElementId) return;

    const pos = getMousePos(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;

    // Constrain to design area
    const constrainedX = Math.max(
      designArea.x,
      Math.min(designArea.x + designArea.width, newX)
    );
    const constrainedY = Math.max(
      designArea.y,
      Math.min(designArea.y + designArea.height, newY)
    );

    onUpdateElement(selectedElementId, { x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-xl p-4 inline-block"
    >
      <canvas
        ref={canvasRef}
        width={canvasConfig.width}
        height={canvasConfig.height}
        className="cursor-crosshair max-w-full h-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* View Label */}
      <div className="text-center mt-3">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {design.currentView} View
        </span>
      </div>
    </div>
  );
});

export default DesignCanvas;

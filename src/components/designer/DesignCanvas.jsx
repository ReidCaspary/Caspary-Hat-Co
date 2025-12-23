import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";

// Hat mockup dimensions and design areas
const HAT_CONFIG = {
  classic: {
    width: 400,
    height: 300,
    front: {
      // Design area for front of hat (relative to canvas)
      x: 100,
      y: 60,
      width: 200,
      height: 120,
    },
    back: {
      x: 100,
      y: 80,
      width: 200,
      height: 100,
    },
  },
  caddie: {
    width: 400,
    height: 300,
    front: {
      x: 100,
      y: 50,
      width: 200,
      height: 130,
    },
    back: {
      x: 100,
      y: 80,
      width: 200,
      height: 100,
    },
  },
};

const DesignCanvas = forwardRef(function DesignCanvas(
  { design, selectedElementId, onSelectElement, onUpdateElement, onViewChange },
  ref
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState({});

  const config = HAT_CONFIG[design.hatStyle] || HAT_CONFIG.classic;
  const designArea = config[design.currentView];

  // Load images for image elements
  useEffect(() => {
    design.elements.forEach((element) => {
      if (element.type === "image" && element.url && !loadedImages[element.id]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [element.id]: img }));
        };
        img.src = element.url;
      }
    });
  }, [design.elements, loadedImages]);

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

    // Draw hat background (simulated with colors)
    drawHatMockup(ctx, design.colors, design.currentView, config);

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
      } else if (element.type === "image" && loadedImages[element.id]) {
        drawImageElement(ctx, element, loadedImages[element.id], isSelected);
      }
    });
  }, [design, selectedElementId, loadedImages, config, designArea]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const drawHatMockup = (ctx, colors, view, cfg) => {
    // Draw simplified hat shape with selected colors
    const centerX = cfg.width / 2;

    if (view === "front") {
      // Draw brim
      ctx.fillStyle = colors.brim;
      ctx.beginPath();
      ctx.ellipse(centerX, 240, 150, 30, 0, 0, Math.PI);
      ctx.fill();

      // Draw front panel
      ctx.fillStyle = colors.front;
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.quadraticCurveTo(centerX, 20, 350, 240);
      ctx.lineTo(50, 240);
      ctx.fill();

      // Draw mesh/back peek (sides)
      ctx.fillStyle = colors.back;
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.quadraticCurveTo(20, 150, 60, 80);
      ctx.lineTo(80, 100);
      ctx.quadraticCurveTo(40, 160, 50, 240);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(350, 240);
      ctx.quadraticCurveTo(380, 150, 340, 80);
      ctx.lineTo(320, 100);
      ctx.quadraticCurveTo(360, 160, 350, 240);
      ctx.fill();

      // Add subtle outline
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.quadraticCurveTo(centerX, 20, 350, 240);
      ctx.stroke();

    } else {
      // Back view
      ctx.fillStyle = colors.back;
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.quadraticCurveTo(centerX, 40, 350, 240);
      ctx.lineTo(50, 240);
      ctx.fill();

      // Draw brim edge
      ctx.fillStyle = colors.brim;
      ctx.beginPath();
      ctx.ellipse(centerX, 240, 150, 20, 0, 0, Math.PI);
      ctx.fill();

      // Snapback closure indicator
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(centerX, 200, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  };

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
        width={config.width}
        height={config.height}
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

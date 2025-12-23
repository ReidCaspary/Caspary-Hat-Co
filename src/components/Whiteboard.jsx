import React, { useRef, useState, useEffect, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { 
  Pencil, Type, Image as ImageIcon, ArrowRight, 
  Minus, Undo, Trash2, Download, MousePointer, Maximize, Minimize
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const WhiteboardComponent = React.forwardRef(({ onSave }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null); // { elementId, handle: 'nw' | 'ne' | 'sw' | 'se' }
  const [currentElement, setCurrentElement] = useState(null);
  const [cursor, setCursor] = useState("default");
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    // Reduced size - approximately 30% smaller
    canvas.width = Math.min(container.offsetWidth, 700);
    canvas.height = 420;

    redrawCanvas();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [elements, selectedElement]);

  useEffect(() => {
    if (tool === "select") {
      setCursor("default");
    } else {
      setCursor("crosshair");
    }
  }, [tool]);

  // Check if there are any images
  useEffect(() => {
    const hasImageElement = elements.some(el => el.type === "image");
    setHasImage(hasImageElement);
  }, [elements]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    elements.forEach(element => {
      drawElement(ctx, element);
    });

    if (selectedElement) {
      const el = elements.find(e => e.id === selectedElement);
      if (el) {
        drawSelectionBox(ctx, el);
      }
    }

    ctx.restore();
  };

  const drawElement = (ctx, element) => {
    ctx.strokeStyle = element.color || "#000000";
    ctx.fillStyle = element.color || "#000000";
    ctx.lineWidth = element.lineWidth || 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (element.type) {
      case "pencil":
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        break;

      case "arrow":
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        
        const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);
        const arrowLength = 15;
        ctx.beginPath();
        ctx.moveTo(element.x2, element.y2);
        ctx.lineTo(
          element.x2 - arrowLength * Math.cos(angle - Math.PI / 6),
          element.y2 - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.x2, element.y2);
        ctx.lineTo(
          element.x2 - arrowLength * Math.cos(angle + Math.PI / 6),
          element.y2 - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case "text":
        ctx.font = `${element.fontSize || 20}px Arial`;
        ctx.fillText(element.text, element.x, element.y);
        break;

      case "image":
        if (element.img && element.img.complete) {
          ctx.drawImage(element.img, element.x, element.y, element.width, element.height);
        }
        break;
    }
  };

  const drawSelectionBox = (ctx, element) => {
    const bounds = getElementBounds(element);
    if (!bounds) return;

    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

    if (element.type === "image") {
      const handleSize = 12;
      const handles = [
        { x: bounds.x, y: bounds.y, cursor: 'nw-resize', handle: 'nw' },
        { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne-resize', handle: 'ne' },
        { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw-resize', handle: 'sw' },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se-resize', handle: 'se' },
      ];

      ctx.fillStyle = "#0066ff";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      
      handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  const getElementBounds = (element) => {
    if (!element) return null;

    switch (element.type) {
      case "pencil":
        const xs = element.points.map(p => p.x);
        const ys = element.points.map(p => p.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys)
        };
      case "line":
      case "arrow":
        return {
          x: Math.min(element.x1, element.x2),
          y: Math.min(element.y1, element.y2),
          width: Math.abs(element.x2 - element.x1),
          height: Math.abs(element.y2 - element.y1)
        };
      case "image":
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };
      case "text":
        return {
          x: element.x,
          y: element.y - (element.fontSize || 20),
          width: element.text.length * ((element.fontSize || 20) * 0.6),
          height: element.fontSize || 20
        };
      default:
        return null;
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const getResizeHandle = (x, y, element) => {
    if (element.type !== "image") return null;

    const bounds = getElementBounds(element);
    if (!bounds) return null;

    const handleSize = 12;
    const handles = [
      { x: bounds.x, y: bounds.y, handle: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, handle: 'ne' },
      { x: bounds.x, y: bounds.y + bounds.height, handle: 'sw' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, handle: 'se' },
    ];

    for (const h of handles) {
      const distance = Math.sqrt((x - h.x) ** 2 + (y - h.y) ** 2);
      if (distance <= handleSize) {
        return h.handle;
      }
    }

    return null;
  };

  const findElementAtPosition = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const bounds = getElementBounds(element);
      
      if (bounds && 
          x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return element.id;
      }
    }
    return null;
  };

  const constrainToCanvas = (x, y, width, height) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x, y, width, height };

    // Constrain position
    const constrainedX = Math.max(0, Math.min(x, canvas.width - width));
    const constrainedY = Math.max(0, Math.min(y, canvas.height - height));

    // Constrain size
    const maxWidth = canvas.width - constrainedX;
    const maxHeight = canvas.height - constrainedY;
    const constrainedWidth = Math.min(width, maxWidth);
    const constrainedHeight = Math.min(height, maxHeight);

    return {
      x: constrainedX,
      y: constrainedY,
      width: constrainedWidth,
      height: constrainedHeight
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);

    if (tool === "select") {
      // Check if clicking on resize handle first
      if (selectedElement) {
        const el = elements.find(e => e.id === selectedElement);
        if (el && el.type === "image") {
          const handle = getResizeHandle(pos.x, pos.y, el);
          if (handle) {
            setResizing({ elementId: selectedElement, handle });
            el._startX = el.x;
            el._startY = el.y;
            el._startWidth = el.width;
            el._startHeight = el.height;
            el._startMouseX = pos.x;
            el._startMouseY = pos.y;
            el._aspectRatio = el.width / el.height;
            return;
          }
        }
      }

      // Check if clicking on an element
      const elementId = findElementAtPosition(pos.x, pos.y);
      if (elementId) {
        const el = elements.find(e => e.id === elementId);
        setSelectedElement(elementId);
        setDragging(true);
        el._startMouseX = pos.x;
        el._startMouseY = pos.y;

        if (el.type === "pencil") {
          el._startPoints = el.points.map(p => ({ ...p }));
        } else if (el.type === "line" || el.type === "arrow") {
          el._startX1 = el.x1;
          el._startY1 = el.y1;
          el._startX2 = el.x2;
          el._startY2 = el.y2;
        } else {
          el._startX = el.x;
          el._startY = el.y;
        }
      } else {
        setSelectedElement(null);
      }
      return;
    }

    const newElement = {
      id: Date.now(),
      type: tool,
      color: color,
      lineWidth: lineWidth,
      x: pos.x,
      y: pos.y,
    };

    if (tool === "pencil") {
      newElement.points = [{ x: pos.x, y: pos.y }];
    } else if (tool === "line" || tool === "arrow") {
      newElement.x1 = pos.x;
      newElement.y1 = pos.y;
      newElement.x2 = pos.x;
      newElement.y2 = pos.y;
    } else if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        newElement.text = text;
        newElement.fontSize = lineWidth * 10;
        addElement(newElement);
      }
      return;
    }

    setCurrentElement(newElement);
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const canvas = canvasRef.current;

    // Update cursor based on hover
    if (tool === "select" && selectedElement && !dragging && !resizing) {
      const el = elements.find(e => e.id === selectedElement);
      if (el && el.type === "image") {
        const handle = getResizeHandle(pos.x, pos.y, el);
        if (handle) {
          const cursors = {
            'nw': 'nw-resize',
            'ne': 'ne-resize',
            'sw': 'sw-resize',
            'se': 'se-resize'
          };
          setCursor(cursors[handle]);
          return;
        }
      }
      setCursor("move");
    }

    if (!dragging && !resizing) return;

    // Handle resizing
    if (resizing) {
      const el = elements.find(e => e.id === resizing.elementId);
      if (el && el.type === "image") {
        const deltaX = pos.x - el._startMouseX;
        const deltaY = pos.y - el._startMouseY;
        
        let newX = el._startX;
        let newY = el._startY;
        let newWidth = el._startWidth;
        let newHeight = el._startHeight;

        // Calculate new dimensions based on handle
        switch (resizing.handle) {
          case 'se': // Bottom-right
            newWidth = el._startWidth + deltaX;
            newHeight = newWidth / el._aspectRatio;
            break;
          case 'sw': // Bottom-left
            newWidth = el._startWidth - deltaX;
            newHeight = newWidth / el._aspectRatio;
            newX = el._startX + el._startWidth - newWidth;
            break;
          case 'ne': // Top-right
            newWidth = el._startWidth + deltaX;
            newHeight = newWidth / el._aspectRatio;
            newY = el._startY + el._startHeight - newHeight;
            break;
          case 'nw': // Top-left
            newWidth = el._startWidth - deltaX;
            newHeight = newWidth / el._aspectRatio;
            newX = el._startX + el._startWidth - newWidth;
            newY = el._startY + el._startHeight - newHeight;
            break;
        }

        // Minimum size constraint
        const minSize = 30;
        if (newWidth < minSize || newHeight < minSize) {
          return;
        }

        // Constrain to canvas
        const constrained = constrainToCanvas(newX, newY, newWidth, newHeight);
        
        const updated = {
          ...el,
          x: constrained.x,
          y: constrained.y,
          width: constrained.width,
          height: constrained.height
        };

        setElements(elements.map(e => e.id === resizing.elementId ? updated : e));
      }
      return;
    }

    // Handle dragging
    if (tool === "select" && selectedElement) {
      const el = elements.find(e => e.id === selectedElement);
      if (el) {
        const deltaX = pos.x - el._startMouseX;
        const deltaY = pos.y - el._startMouseY;
        
        let updated = { ...el };

        if (el.type === "pencil") {
          updated.points = el._startPoints.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }));
        } else if (el.type === "line" || el.type === "arrow") {
          updated.x1 = el._startX1 + deltaX;
          updated.y1 = el._startY1 + deltaY;
          updated.x2 = el._startX2 + deltaX;
          updated.y2 = el._startY2 + deltaY;
        } else if (el.type === "image") {
          let newX = el._startX + deltaX;
          let newY = el._startY + deltaY;
          
          // Constrain to canvas boundaries
          const constrained = constrainToCanvas(newX, newY, el.width, el.height);
          updated.x = constrained.x;
          updated.y = constrained.y;
        } else {
          updated.x = el._startX + deltaX;
          updated.y = el._startY + deltaY;
        }

        setElements(elements.map(e => e.id === selectedElement ? updated : e));
      }
      return;
    }

    if (currentElement) {
      const updated = { ...currentElement };

      if (tool === "pencil") {
        updated.points = [...currentElement.points, { x: pos.x, y: pos.y }];
      } else if (tool === "line" || tool === "arrow") {
        updated.x2 = pos.x;
        updated.y2 = pos.y;
      }

      setElements([...elements.filter(e => e.id !== updated.id), updated]);
      setCurrentElement(updated);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();

    if (currentElement) {
      addElement(currentElement);
      setCurrentElement(null);
    }
    
    if (selectedElement) {
      setElements(prevElements => prevElements.map(el => {
        if (el.id === selectedElement) {
          const { _startX, _startY, _startWidth, _startHeight, _startX1, _startY1, _startX2, _startY2, _startMouseX, _startMouseY, _startPoints, _aspectRatio, ...rest } = el;
          return rest;
        }
        return el;
      }));
    }

    setDragging(false);
    setResizing(null);
    setCursor(tool === "select" ? "default" : "crosshair");
  };

  const addElement = (element) => {
    const newElements = [...elements, element];
    setElements(newElements);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1]);
      setSelectedElement(null);
    }
  };

  const _performClearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryStep(0);
    setSelectedElement(null);
  };

  const deleteSelected = () => {
    if (selectedElement) {
      const newElements = elements.filter(e => e.id !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please drop a valid image file (PNG, JPG, JPEG, or WEBP)');
      return;
    }

    await processImageFile(file);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processImageFile(file);
    e.target.value = '';
  };

  const processImageFile = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = file_url;
      img.onload = () => {
        const canvas = canvasRef.current;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate scaling to fit image centered in canvas
        const scaleX = canvasWidth * 0.8 / img.width;
        const scaleY = canvasHeight * 0.8 / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;

        const newElement = {
          id: Date.now(),
          type: "image",
          x,
          y,
          width,
          height,
          img
        };
        
        addElement(newElement);
        setSelectedElement(newElement.id);
      };
      img.onerror = () => {
        alert("Failed to load image.");
      };
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image.");
    }
  };

  // Fullscreen handlers
  const toggleFullscreen = () => {
    const container = containerRef.current;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    ctx.save();
    elements.forEach(element => {
      drawElement(ctx, element);
    });
    ctx.restore();
    
    const dataUrl = exportCanvas.toDataURL("image/png");
    return dataUrl;
  };

  const downloadCanvas = () => {
    const dataUrl = exportCanvas();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = dataUrl;
    link.click();
  };

  useImperativeHandle(ref, () => ({
    exportCanvas,
    clearCanvas: _performClearCanvas,
  }));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElement) {
          e.preventDefault();
          deleteSelected();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, historyStep, elements]);

  return (
    <div ref={containerRef} className={`space-y-3 ${isFullscreen ? 'bg-gray-100 p-8 flex flex-col items-center justify-center h-screen' : ''}`}>
      <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg">
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant={tool === "select" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("select")}
            className={`h-8 ${tool === "select" ? "bg-[var(--primary)]" : ""}`}
            title="Select"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-8 bg-gray-300" />
          
          <Button
            type="button"
            variant={tool === "pencil" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pencil")}
            className={`h-8 ${tool === "pencil" ? "bg-[var(--primary)]" : ""}`}
            title="Draw"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant={tool === "line" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("line")}
            className={`h-8 ${tool === "line" ? "bg-[var(--primary)]" : ""}`}
            title="Line"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant={tool === "arrow" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("arrow")}
            className={`h-8 ${tool === "arrow" ? "bg-[var(--primary)]" : ""}`}
            title="Arrow"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant={tool === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("text")}
            className={`h-8 ${tool === "text" ? "bg-[var(--primary)]" : ""}`}
            title="Text"
          >
            <Type className="w-4 h-4" />
          </Button>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
            id="whiteboard-image-upload"
          />
          <label htmlFor="whiteboard-image-upload">
            <Button type="button" variant="outline" size="sm" className="h-8" asChild>
              <span className="cursor-pointer">
                <ImageIcon className="w-4 h-4" />
              </span>
            </Button>
          </label>
        </div>

        <div className="w-px h-8 bg-gray-300" />

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Color"
          />
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
            title="Stroke width"
          />
        </div>

        <div className="w-px h-8 bg-gray-300" />

        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={undo} 
            disabled={historyStep <= 0}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => {
              if (confirm("Clear all content?")) {
                _performClearCanvas();
              }
            }}
            title="Clear all"
          >
            Clear
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={downloadCanvas}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div 
        className={`border-2 rounded-lg overflow-hidden bg-white relative transition-all ${
          isDragOver ? 'border-[var(--accent)] border-dashed bg-[var(--accent)]/5' : 'border-gray-300'
        } ${isFullscreen ? 'shadow-2xl' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="w-full touch-none"
          style={{ cursor }}
        />
        {!hasImage && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isDragOver ? 'opacity-100' : 'opacity-40'}`}>
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[var(--gray-medium)]" />
              <p className="text-lg font-semibold text-[var(--gray-medium)]">
                Drag image here
              </p>
              <p className="text-sm text-[var(--gray-medium)] mt-1">
                or click the image icon above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default WhiteboardComponent;
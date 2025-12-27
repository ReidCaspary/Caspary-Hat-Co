import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import StyleSelector from "./StyleSelector";
import ColorPicker from "./ColorPicker";
import DesignCanvas from "./DesignCanvas";
import DesignToolbar from "./DesignToolbar";
import TextEditor from "./TextEditor";
import ImageUploader from "./ImageUploader";
import PricingPanel from "./PricingPanel";
import SubmitForm from "./SubmitForm";
import { fetchHatConfig, DEFAULT_CONFIG, getDefaultColors } from "@/config/hatConfig";

const STEPS = [
  { id: 1, name: "Style", description: "Choose your hat style" },
  { id: 2, name: "Colors", description: "Pick your colors" },
  { id: 3, name: "Design", description: "Add text & logos" },
  { id: 4, name: "Review", description: "Review & submit" },
];

export default function HatDesigner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTool, setActiveTool] = useState(null); // 'text' | 'image' | null
  const [selectedElementId, setSelectedElementId] = useState(null);
  const canvasRef = useRef(null);

  // Fetch hat configuration from API with fallback to defaults
  const { data: config = DEFAULT_CONFIG, isLoading: configLoading } = useQuery({
    queryKey: ['hatConfig'],
    queryFn: fetchHatConfig,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const [design, setDesign] = useState({
    hatStyle: null,
    colors: {
      front: "#172c63",
      mesh: "#ffffff",
      brim: "#172c63",
      rope: "#ffffff",
    },
    elements: [],
    currentView: "front",
    quantity: 144,
  });

  const updateDesign = useCallback((updates) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  }, []);

  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `elem-${Date.now()}`,
      placement: design.currentView,
    };
    setDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
    setActiveTool(null);
  }, [design.currentView]);

  const updateElement = useCallback((id, updates) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  }, []);

  const deleteElement = useCallback((id) => {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    setSelectedElementId(null);
  }, []);

  const selectedElement = design.elements.find((el) => el.id === selectedElementId);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return design.hatStyle !== null;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const exportDesign = () => {
    if (canvasRef.current) {
      return canvasRef.current.exportCanvas();
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-gray-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Site</span>
          </Link>
          <h1 className="text-xl font-bold">Hat Designer</h1>
          <div className="w-32" /> {/* Spacer */}
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-2 cursor-pointer ${
                    currentStep >= step.id ? "text-[var(--primary)]" : "text-gray-400"
                  }`}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-sm">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Tools/Options */}
        <div className="w-full lg:w-80 bg-white border-r p-4 lg:p-6 overflow-y-auto">
          {currentStep === 1 && (
            <StyleSelector
              selectedStyle={design.hatStyle}
              hatTypes={config.hatTypes}
              onSelectStyle={(style) => {
                // Apply default colors for the selected hat style
                const defaultColors = getDefaultColors(style, config.hatTypes);
                updateDesign({ hatStyle: style, colors: defaultColors });
              }}
            />
          )}

          {currentStep === 2 && (
            <ColorPicker
              colors={design.colors}
              hatStyle={design.hatStyle}
              hatTypes={config.hatTypes}
              colorPresets={config.colorPresets}
              colorCombinations={config.colorCombinations}
              onColorChange={(part, color) =>
                updateDesign({ colors: { ...design.colors, [part]: color } })
              }
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <DesignToolbar
                activeTool={activeTool}
                onToolSelect={setActiveTool}
              />

              {activeTool === "text" && (
                <TextEditor
                  onAddText={addElement}
                  selectedElement={selectedElement?.type === "text" ? selectedElement : null}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                />
              )}

              {activeTool === "image" && (
                <ImageUploader
                  onAddImage={addElement}
                  selectedElement={selectedElement?.type === "image" ? selectedElement : null}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                />
              )}

              {!activeTool && selectedElement && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Selected: {selectedElement.type}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTool(selectedElement.type)}
                  >
                    Edit {selectedElement.type}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={() => deleteElement(selectedElement.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}

              {!activeTool && !selectedElement && (
                <p className="text-sm text-gray-500 text-center py-8">
                  Select a tool above to add text or upload your logo
                </p>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <SubmitForm
              design={design}
              designPreview={exportDesign()}
            />
          )}
        </div>

        {/* Center - Canvas Preview */}
        <div className="flex-1 bg-gray-100 p-4 lg:p-8 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <DesignCanvas
              ref={canvasRef}
              design={design}
              hatTypes={config.hatTypes}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={updateElement}
              onViewChange={(view) => updateDesign({ currentView: view })}
            />
          </div>

          {/* View Toggle */}
          {currentStep >= 2 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant={design.currentView === "front" ? "default" : "outline"}
                size="sm"
                onClick={() => updateDesign({ currentView: "front" })}
              >
                Front View
              </Button>
              <Button
                variant={design.currentView === "back" ? "default" : "outline"}
                size="sm"
                onClick={() => updateDesign({ currentView: "back" })}
              >
                Back View
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Pricing */}
        <div className="w-full lg:w-72 bg-white border-l p-4 lg:p-6">
          <PricingPanel
            quantity={design.quantity}
            onQuantityChange={(qty) => updateDesign({ quantity: qty })}
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="bg-white border-t px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-[var(--accent)] hover:bg-[var(--primary)]"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="submit-form"
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quote Request
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
